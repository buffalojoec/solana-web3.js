import { SolanaRpcMethods } from '@solana/rpc-core';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { createGraphQLCache, GraphQLCache } from './cache';
import { AccountQueryArgs } from './schema/account';
import { BlockQueryArgs } from './schema/block';
import { TransactionQueryArgs } from './schema/transaction';

export interface RpcGraphQLContext {
    cache: GraphQLCache;
    resolveAccount(args: AccountQueryArgs): ReturnType<typeof resolveAccount>;
    resolveBlock(args: BlockQueryArgs): ReturnType<typeof resolveBlock>;
    resolveTransaction(args: TransactionQueryArgs): ReturnType<typeof resolveTransaction>;
    rpc: Rpc<SolanaRpcMethods>;
}

// Default to jsonParsed encoding if none is provided
async function resolveAccount(
    { address, encoding = 'jsonParsed', ...config }: AccountQueryArgs,
    cache: GraphQLCache,
    rpc: Rpc<SolanaRpcMethods>
) {
    const requestConfig = { encoding, ...config };

    const cached = cache.get(address, requestConfig);
    if (cached !== null) {
        return cached;
    }

    const account = await rpc
        .getAccountInfo(address, requestConfig as Parameters<SolanaRpcMethods['getAccountInfo']>[1])
        .send()
        .then(res => res.value);

    if (account === null) {
        return null;
    }

    const [data, responseEncoding] = Array.isArray(account.data)
        ? encoding === 'jsonParsed'
            ? [account.data[0], 'base64']
            : [account.data[0], encoding]
        : [account.data, 'jsonParsed'];
    const queryResponse = {
        ...account,
        data,
        encoding: responseEncoding,
    };

    cache.insert(address, requestConfig, queryResponse);

    return queryResponse;
}

async function resolveBlock({ slot, ...config }: BlockQueryArgs, cache: GraphQLCache, rpc: Rpc<SolanaRpcMethods>) {
    const cached = cache.get(slot, config);
    if (cached !== null) {
        return cached;
    }

    const block = await rpc.getBlock(slot, config as Parameters<SolanaRpcMethods['getBlock']>[1]).send();

    if (block === null) {
        return null;
    }

    cache.insert(slot, config, block);

    return block;
}

async function resolveTransaction(
    { signature, ...config }: TransactionQueryArgs,
    cache: GraphQLCache,
    rpc: Rpc<SolanaRpcMethods>
) {
    const cached = cache.get(signature, config);
    if (cached !== null) {
        return cached;
    }

    const transaction = await rpc
        .getTransaction(signature, config as Parameters<SolanaRpcMethods['getTransaction']>[1])
        .send();

    if (transaction === null) {
        return null;
    }

    cache.insert(signature, config, transaction);

    return transaction;
}

export function createSolanaGraphQLContext(rpc: Rpc<SolanaRpcMethods>): RpcGraphQLContext {
    const cache = createGraphQLCache();
    return {
        cache,
        resolveAccount(args) {
            return resolveAccount(args, this.cache, this.rpc);
        },
        resolveBlock(args) {
            return resolveBlock(args, this.cache, this.rpc);
        },
        resolveTransaction(args) {
            return resolveTransaction(args, this.cache, this.rpc);
        },
        rpc,
    };
}
