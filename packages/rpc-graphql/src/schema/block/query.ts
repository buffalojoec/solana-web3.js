import { Commitment } from '@solana/rpc-core';
import { Slot } from '@solana/rpc-core/dist/types/rpc-methods/common';

import { RpcGraphQLContext } from '../../context';
import { bigint, nonNull } from '../picks';
import { blockInputFields } from './inputs';
import { block } from './types';

// TODO: Not sure if I will include all configs yet.
export type BlockQueryArgs = {
    slot: Slot;
    commitment?: Commitment;
    // encoding?: 'base58' | 'base64' | 'json' | 'jsonParsed';
    // maxSupportedTransactionVersion?: 0;
    // rewards?: boolean;
    // transactionDetails?: 'accounts' | 'full' | 'none' | 'signatures';
};

/**
 * Block root query for GraphQL
 */
export const blockQuery = {
    block: {
        args: {
            ...blockInputFields,
            slot: nonNull(bigint()),
        },
        resolve: (_parent: unknown, args: BlockQueryArgs, context: RpcGraphQLContext) => context.resolveBlock(args),
        type: block,
    },
};
