import {
    Callable,
    createRpcMessage,
    Flatten,
    OverloadImplementations,
    RpcError,
    RpcResponse,
    UnionToIntersection,
} from '@solana/rpc-spec-types';

import { RpcSubscriptionsApi } from './rpc-subscriptions-api';
import {
    PendingRpcSubscriptionsRequest,
    RpcSubscribeOptions,
    RpcSubscriptionsRequest,
} from './rpc-subscriptions-request';
import { RpcSubscriptionsTransport } from './rpc-subscriptions-transport';

export type RpcSubscriptionsConfig<
    TRpcMethods,
    TRpcSubscriptionsTransport extends RpcSubscriptionsTransport,
> = Readonly<{
    api: RpcSubscriptionsApi<TRpcMethods>;
    transport: TRpcSubscriptionsTransport;
}>;

export type RpcSubscriptions<TRpcSubscriptionsMethods> = {
    [TMethodName in keyof TRpcSubscriptionsMethods]: PendingRpcSubscriptionsRequestBuilder<
        OverloadImplementations<TRpcSubscriptionsMethods, TMethodName>
    >;
};

type PendingRpcSubscriptionsRequestBuilder<TSubscriptionMethodImplementations> = UnionToIntersection<
    Flatten<{
        [P in keyof TSubscriptionMethodImplementations]: PendingRpcSubscriptionsRequestReturnTypeMapper<
            TSubscriptionMethodImplementations[P]
        >;
    }>
>;

type PendingRpcSubscriptionsRequestReturnTypeMapper<TSubscriptionMethodImplementation> =
    // Check that this property of the TRpcSubscriptionMethods interface is, in fact, a function.
    TSubscriptionMethodImplementation extends Callable
        ? (
              ...args: Parameters<TSubscriptionMethodImplementation>
          ) => PendingRpcSubscriptionsRequest<ReturnType<TSubscriptionMethodImplementation>>
        : never;

type RpcNotification<TNotification> = Readonly<{
    params: Readonly<{
        result: TNotification;
        subscription: number;
    }>;
}>;

type RpcSubscriptionId = number;

export function createSubscriptionRpc<
    TRpcSubscriptionsApiMethods,
    TRpcSubscriptionsTransport extends RpcSubscriptionsTransport,
>(
    rpcConfig: RpcSubscriptionsConfig<TRpcSubscriptionsApiMethods, TRpcSubscriptionsTransport>,
): RpcSubscriptions<TRpcSubscriptionsApiMethods> {
    return makeProxy(rpcConfig);
}

function makeProxy<TRpcSubscriptionsApiMethods, TRpcSubscriptionsTransport extends RpcSubscriptionsTransport>(
    rpcConfig: RpcSubscriptionsConfig<TRpcSubscriptionsApiMethods, TRpcSubscriptionsTransport>,
): RpcSubscriptions<TRpcSubscriptionsApiMethods> {
    return new Proxy(rpcConfig.api, {
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get(target, p, receiver) {
            return function (...rawParams: unknown[]) {
                const methodName = p.toString();
                const createRpcSubscription = Reflect.get(target, methodName, receiver);
                if (p.toString().endsWith('Notifications') === false && !createRpcSubscription) {
                    // TODO: Coded error.
                    throw new Error(
                        "Either the notification name must end in 'Notifications' or the API " +
                            'must supply a subscription creator function to map between the ' +
                            'notification name and the subscribe/unsubscribe method names.',
                    );
                }
                const newRequest = createRpcSubscription
                    ? createRpcSubscription(...rawParams)
                    : {
                          params: rawParams,
                          subscribeMethodName: methodName.replace(/Notifications$/, 'Subscribe'),
                          unsubscribeMethodName: methodName.replace(/Notifications$/, 'Unsubscribe'),
                      };
                return createPendingRpcSubscription(rpcConfig, newRequest);
            };
        },
    }) as RpcSubscriptions<TRpcSubscriptionsApiMethods>;
}

function registerIterableCleanup(iterable: AsyncIterable<unknown>, cleanupFn: CallableFunction) {
    (async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for await (const _ of iterable);
        } catch {
            /* empty */
        } finally {
            // Run the cleanup function.
            cleanupFn();
        }
    })();
}

function createPendingRpcSubscription<
    TRpcSubscriptionsApiMethods,
    TRpcSubscriptionsTransport extends RpcSubscriptionsTransport,
    TNotification,
>(
    rpcConfig: RpcSubscriptionsConfig<TRpcSubscriptionsApiMethods, TRpcSubscriptionsTransport>,
    { params, subscribeMethodName, unsubscribeMethodName, responseTransformer }: RpcSubscriptionsRequest<TNotification>,
): PendingRpcSubscriptionsRequest<TNotification> {
    return {
        async subscribe({ abortSignal }: RpcSubscribeOptions): Promise<AsyncIterable<TNotification>> {
            abortSignal.throwIfAborted();
            let subscriptionId: number | undefined;
            function handleCleanup() {
                if (subscriptionId !== undefined) {
                    const payload = createRpcMessage(unsubscribeMethodName, [subscriptionId]);
                    connection.send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(payload).finally(() => {
                        connectionAbortController.abort();
                    });
                } else {
                    connectionAbortController.abort();
                }
            }
            abortSignal.addEventListener('abort', handleCleanup);
            /**
             * STEP 1: Send the subscribe message.
             */
            const connectionAbortController = new AbortController();
            const subscribeMessage = createRpcMessage(subscribeMethodName, params);
            const connection = await rpcConfig.transport({
                payload: subscribeMessage,
                signal: connectionAbortController.signal,
            });
            function handleConnectionCleanup() {
                abortSignal.removeEventListener('abort', handleCleanup);
            }
            registerIterableCleanup(connection, handleConnectionCleanup);
            /**
             * STEP 2: Wait for the acknowledgement from the server with the subscription id.
             */
            for await (const message of connection as AsyncIterable<
                RpcNotification<unknown> | RpcResponse<RpcSubscriptionId>
            >) {
                if ('id' in message && message.id === subscribeMessage.id) {
                    if ('error' in message) {
                        throw new RpcError(message.error);
                    } else {
                        subscriptionId = message.result as RpcSubscriptionId;
                        break;
                    }
                }
            }
            if (subscriptionId == null) {
                // TODO: Coded error.
                throw new Error('Failed to obtain a subscription id from the server');
            }
            /**
             * STEP 3: Return an iterable that yields notifications for this subscription id.
             */
            return {
                async *[Symbol.asyncIterator]() {
                    for await (const message of connection as AsyncIterable<
                        RpcNotification<unknown> | RpcResponse<RpcSubscriptionId>
                    >) {
                        if (!('params' in message) || message.params.subscription !== subscriptionId) {
                            continue;
                        }
                        const notification = message.params.result as TNotification;
                        yield responseTransformer
                            ? responseTransformer(notification, subscribeMethodName)
                            : notification;
                    }
                },
            };
        },
    };
}
