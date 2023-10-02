import { GraphQLEnumType } from 'graphql';

import { bigint, type } from '../picks';
import { commitmentInputType, dataSliceInputType } from '../types';

export const accountEncodingInputType = new GraphQLEnumType({
    name: 'AccountEncoding',
    values: {
        base58: {
            value: 'base58',
        },
        base64: {
            value: 'base64',
        },
        base64Zstd: {
            value: 'base64+zstd',
        },
        jsonParsed: {
            value: 'jsonParsed',
        },
    },
});

export const accountInputFields = {
    commitment: type(commitmentInputType),
    dataSlice: type(dataSliceInputType),
    encoding: type(accountEncodingInputType),
    minContextSlot: bigint(),
};
