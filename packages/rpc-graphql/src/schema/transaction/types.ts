import { GraphQLEnumType, GraphQLObjectType, GraphQLScalarType, GraphQLUnionType } from 'graphql';

import { bigint, boolean, list, number, object, string, type } from '../picks';
import { transactionInputFields } from './inputs';
import { transactionInterface, transactionInterfaceFields } from './interface';

const TokenBalance = new GraphQLObjectType({
    fields: {
        accountIndex: number(),
        mint: string(),
        owner: string(),
        programId: string(),
        uiAmountString: string(),
    },
    name: 'TokenBalance',
});

const TransactionStatus = new GraphQLUnionType({
    name: 'TransactionStatus',
    types: [
        new GraphQLObjectType({
            fields: {
                Err: string(),
            },
            name: 'TransactionStatusError',
        }),
        new GraphQLObjectType({
            fields: {
                Ok: string(),
            },
            name: 'TransactionStatusOk',
        }),
    ],
});

const TransactionVersion = new GraphQLEnumType({
    name: 'TransactionVersion',
    values: {
        '0': {},
        legacy: {},
    },
});

const Reward = new GraphQLObjectType({
    fields: {
        commission: number(),
        lamports: bigint(),
        postBalance: bigint(),
        pubkey: string(),
        rewardType: string(),
    },
    name: 'Reward',
});

const AddressTableLookup = new GraphQLObjectType({
    fields: {
        accountKey: string(),
        readableIndexes: list(number()),
        writableIndexes: list(number()),
    },
    name: 'AddressTableLookup',
});

const ParsedTransactionInstruction = new GraphQLObjectType({
    fields: {
        parsed: object('ParsedTransactionInstructionParsed', {
            type: string(),
            // info? // TODO
        }),
        program: string(),
        programId: string(),
    },
    name: 'ParsedTransactionInstruction',
});

const PartiallyDecodedTransactionInstruction = new GraphQLObjectType({
    fields: {
        accounts: list(string()),
        data: string(),
        programId: string(),
    },
    name: 'PartiallyDecodedTransactionInstruction',
});

const ReturnData = new GraphQLObjectType({
    fields: {
        data: string(),
        programId: string(),
    },
    name: 'ReturnData',
});

const TransactionInstruction = new GraphQLObjectType({
    fields: {
        accounts: list(number()),
        data: string(),
        programIdIndex: number(),
    },
    name: 'TransactionInstruction',
});

const TransactionParsedAccountLegacy = new GraphQLObjectType({
    fields: {
        pubkey: string(),
        signer: boolean(),
        source: string(), // `transaction`
        writable: boolean(),
    },
    name: 'TransactionParsedAccountLegacy',
});

const TransactionParsedAccountVersioned = new GraphQLObjectType({
    fields: {
        pubkey: string(),
        signer: boolean(),
        source: string(), // `lookupTable` | `transaction`
        writable: boolean(),
    },
    name: 'TransactionParsedAccountVersioned',
});

const transactionMeta = new GraphQLObjectType({
    description: 'Transaction metadata',
    fields: {
        //
    },
    name: 'TransactionMeta',
});

const TransactionForAccountsMetaBase = new GraphQLObjectType({
    fields: {
        err: string(),
        fee: bigint(),
        logMessages: list(bigint()),
        postBalances: list(bigint()),
        postTokenBalances: list(type(TokenBalance)),
        preBalances: list(number()),
        preTokenBalances: list(type(TokenBalance)),
        status: type(TransactionStatus),
    },
    name: 'TransactionForAccountsMetaBase',
});

const TransactionForAccounts = new GraphQLUnionType({
    name: 'TransactionForAccounts',
    types: [
        new GraphQLObjectType({
            fields: {
                meta: type(TransactionForAccountsMetaBase),
                transaction: object('TransactionForAccountsTransactionLegacy', {
                    accountKeys: list(type(TransactionParsedAccountLegacy)),
                    signatures: list(string()),
                }),
            },
            name: 'TransactionForAccountsBase58',
        }),
        new GraphQLObjectType({
            fields: {
                meta: type(TransactionForAccountsMetaBase),
                transaction: object('TransactionForAccountsTransactionVersioned', {
                    accountKeys: list(type(TransactionParsedAccountVersioned)),
                    signatures: list(string()),
                }),
                version: type(TransactionVersion),
            },
            name: 'TransactionForAccountsBase64',
        }),
    ],
});

const TransactionForFullMetaBase = new GraphQLObjectType({
    fields: {
        computeUnitsUsed: bigint(),
        err: string(),
        fee: bigint(),
        logMessages: list(string()),
        postBalances: list(bigint()),
        postTokenBalances: list(type(TokenBalance)),
        preBalances: list(bigint()),
        preTokenBalances: list(type(TokenBalance)),
        returnData: type(ReturnData),
        rewards: list(type(Reward)),
        status: type(TransactionStatus),
    },
    name: 'TransactionForFullMetaBase',
});

const TransactionForFullMetaInnerInstructionsUnparsed = new GraphQLObjectType({
    fields: {
        index: number(),
        instructions: list(type(TransactionInstruction)),
    },
    name: 'TransactionForFullMetaInnerInstructionsUnparsed',
});

const TransactionForFullMetaInnerInstructionsParsed = new GraphQLObjectType({
    fields: {
        index: number(),
        instructions: list(
            type(
                new GraphQLUnionType({
                    name: 'TransactionForFullMetaInnerInstructionsParsedInstruction',
                    types: [ParsedTransactionInstruction, PartiallyDecodedTransactionInstruction],
                })
            )
        ),
    },
    name: 'TransactionForFullMetaInnerInstructions',
});

const TransactionForFullMetaLoadedAddresses = new GraphQLObjectType({
    fields: {
        address: string(),
        programId: string(),
    },
    name: 'TransactionForFullMetaLoadedAddresses',
});

const TransactionForFullTransactionAddressTableLookups = new GraphQLObjectType({
    fields: {
        addressTableLookups: list(type(AddressTableLookup)),
    },
    name: 'TransactionForFullTransactionAddressTableLookups',
});

// Base58
// Base64
// JsonParsed
// Json

// A transaction type implementing the transaction interface with a
// specified data encoding structure
const transactionType = (
    name: string,
    description: string,
    data: { type: GraphQLScalarType | GraphQLObjectType }
): GraphQLObjectType =>
    new GraphQLObjectType({
        description,
        fields: {
            ...transactionInterfaceFields,
            data,
            owner: {
                args: transactionInputFields,
                resolve: (parent, args, context) => context.resolveTransaction({ ...args, address: parent.owner }),
                type: transactionInterface,
            },
        },
        interfaces: [transactionInterface],
        name,
    });

/**
 * Transaction types for GraphQL
 */
export const transactionTypes = [
    transactionType('TransactionBase58', 'A Solana transaction with base58 encoded data', string()),
    transactionType('TransactionBase64', 'A Solana transaction with base64 encoded data', string()),
];
