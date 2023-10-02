import { GraphQLEnumType } from 'graphql';

import { type } from '../picks';
import { commitmentInputType } from '../types';

export const transactionEncodingInputType = new GraphQLEnumType({
    name: 'TransactionEncoding',
    values: {
        base58: {
            value: 'base58',
        },
        base64: {
            value: 'base64',
        },
        json: {
            value: 'json',
        },
        jsonParsed: {
            value: 'jsonParsed',
        },
    },
});

export const transactionInputFields = {
    commitment: type(commitmentInputType),
    encoding: type(transactionEncodingInputType),
};
