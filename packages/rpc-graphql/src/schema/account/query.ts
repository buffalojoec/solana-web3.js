import { Base58EncodedAddress } from '@solana/addresses';
import { Commitment } from '@solana/rpc-core';

import { RpcGraphQLContext } from '../../context';
import { nonNull, string } from '../picks';
import { accountInputFields } from './inputs';
import { accountInterface } from './interface';

export type AccountQueryArgs = {
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
 * Account root query for GraphQL
 */
export const accountQuery = {
    account: {
        args: {
            ...accountInputFields,
            address: nonNull(string()),
        },
        resolve: (_parent: unknown, args: AccountQueryArgs, context: RpcGraphQLContext) => context.resolveAccount(args),
        type: accountInterface,
    },
};
