import { GraphQLInterfaceType } from 'graphql';

import { bigint, boolean, string, type } from '../picks';

export const transactionInterfaceFields = {
    encoding: string(),
    executable: boolean(),
    lamports: bigint(),
    rentEpoch: bigint(),
};

export const transactionInterface: GraphQLInterfaceType = new GraphQLInterfaceType({
    description: 'A Solana transaction',
    fields: () => ({
        ...transactionInterfaceFields,
        owner: type(transactionInterface),
    }),
    name: 'Transaction',
    resolveType(transaction) {
        // TODO
        return 'TransactionBase64';
    },
});
