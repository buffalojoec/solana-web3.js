import { GraphQLEnumType, GraphQLInputObjectType, GraphQLObjectType } from 'graphql';

import { bigint, number, string } from './picks';

export const commitmentInputType = new GraphQLEnumType({
    name: 'Commitment',
    values: {
        confirmed: {
            value: 'confirmed',
        },
        finalized: {
            value: 'finalized',
        },
        processed: {
            value: 'processed',
        },
    },
});

export const dataSliceInputType = new GraphQLInputObjectType({
    fields: {
        length: number(),
        offset: number(),
    },
    name: 'DataSliceConfig',
});

export const tokenAmountType = new GraphQLObjectType({
    fields: {
        amount: string(),
        decimals: number(),
        uiAmount: bigint(),
        uiAmountString: string(),
    },
    name: 'TokenAmount',
});
