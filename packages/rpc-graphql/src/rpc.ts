import { SolanaRpcMethods } from '@solana/rpc-core';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { ExecutionResult, graphql, GraphQLObjectType, GraphQLSchema, Source } from 'graphql';
import { Maybe } from 'graphql/jsutils/Maybe';

import { createSolanaGraphQLContext, RpcGraphQLContext } from './context';
import { accountQuery, accountTypes } from './schema/account';
import { blockQuery, blockTypes } from './schema/block';
import { transactionQuery, transactionTypes } from './schema/transaction';

const solanaGraphQLSchema: GraphQLSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
        fields: {
            ...accountQuery,
            ...blockQuery,
            ...transactionQuery,
        },
        name: 'RootQuery',
    }),
    types: [...accountTypes, ...blockTypes, ...transactionTypes],
});

export interface RpcGraphQL {
    context: RpcGraphQLContext;
    query(
        source: string | Source,
        variableValues?: Maybe<{ readonly [variable: string]: unknown }>
    ): Promise<ExecutionResult>;
    schema: GraphQLSchema;
}

export function createRpcGraphQL(rpc: Rpc<SolanaRpcMethods>): RpcGraphQL {
    const context = createSolanaGraphQLContext(rpc);
    return {
        context,
        async query(
            source: string | Source,
            variableValues?: Maybe<{ readonly [variable: string]: unknown }>
        ): Promise<ExecutionResult> {
            return graphql({
                contextValue: this.context,
                schema: this.schema,
                source,
                variableValues,
            });
        },
        schema: solanaGraphQLSchema,
    };
}
