import { type } from '../picks';
import { commitmentInputType } from '../types';

// TODO: Not sure if I will include all configs yet.
// export const blockEncodingInputType = new GraphQLEnumType({
//     name: 'BlockEncoding',
//     values: {
//         base58: {
//             value: 'base58',
//         },
//         base64: {
//             value: 'base64',
//         },
//         json: {
//             value: 'json',
//         },
//         jsonParsed: {
//             value: 'jsonParsed',
//         },
//     },
// });

// TODO: Not sure if I will include all configs yet.
// export const blockTransactionDetailsInputType = new GraphQLEnumType({
//     name: 'BlockTransactionDetails',
//     values: {
//         accounts: {
//             value: 'accounts',
//         },
//         full: {
//             value: 'full',
//         },
//         none: {
//             value: 'none',
//         },
//         signatures: {
//             value: 'signatures',
//         },
//     },
// });

// TODO: Not sure if I will include all configs yet.
export const blockInputFields = {
    commitment: type(commitmentInputType),
    // encoding: type(blockEncodingInputType),
    // maxSupportedTransactionVersion: number(),
    // rewards: boolean(),
    // transactionDetails: type(blockTransactionDetailsInputType),
};
