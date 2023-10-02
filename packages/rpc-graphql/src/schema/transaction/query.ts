import { Base58EncodedAddress } from '@solana/addresses';
import { Commitment } from '@solana/rpc-core';

import { RpcGraphQLContext } from '../../context';
import { nonNull, string } from '../picks';
import { transactionInputFields } from './inputs';
import { transactionInterface } from './interface';

export type TransactionQueryArgs = {
    address: Base58EncodedAddress;
    commitment?: Commitment;
    dataSlice?: {
        offset: number;
        length: number;
    };
    encoding?: 'base58' | 'base64' | 'base64+zstd' | 'jsonParsed';
    minContextSlot?: bigint;
};

/**
 * Transaction root query for GraphQL
 */
export const transactionQuery = {
    transaction: {
        args: {
            ...transactionInputFields,
            address: nonNull(string()),
        },
        resolve: (_parent: unknown, args: TransactionQueryArgs, context: RpcGraphQLContext) =>
            context.resolveTransaction(args),
        type: transactionInterface,
    },
};
