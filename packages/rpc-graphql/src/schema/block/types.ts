import { GraphQLObjectType } from 'graphql';

import { bigint, list, number, string, type } from '../picks';

const blockReward = new GraphQLObjectType({
    description: 'A block reward',
    fields: {
        commission: number(),
        lamports: bigint(),
        postBalance: bigint(),
        pubkey: string(),
        rewardType: string(),
    },
    name: 'BlockReward',
});

// TODO: Not sure if I will include all of a block yet.
export const block = new GraphQLObjectType({
    description: 'A Solana block',
    fields: {
        blockHeight: bigint(),
        blockTime: number(),
        blockhash: string(),
        parentSlot: bigint(),
        previousBlockhash: string(),
        rewards: list(type(blockReward)),
    },
    name: 'Block',
});

export const blockTypes = [block];
