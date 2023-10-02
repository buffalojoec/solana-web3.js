import { GraphQLFieldConfig, GraphQLObjectType, GraphQLScalarType, ThunkObjMap } from 'graphql';

import { bigint, boolean, list, number, object, string, type } from '../picks';
import { tokenAmountType } from '../types';
import { accountInputFields } from './inputs';
import { accountInterface, accountInterfaceFields } from './interface';

// Builds JSON parsed account data
// Note: JSON parsed data is only available for account types with known schemas.
// Any account with an unknown schema will return base64 encoded data.
// See https://docs.solana.com/api/http#parsed-responses
const accountDataJsonParsed = (name: string, parsedInfoFields: ThunkObjMap<GraphQLFieldConfig<void, void>>) =>
    object(name + 'Data', {
        parsed: object(name + 'DataParsed', {
            info: object(name + 'DataParsedInfo', parsedInfoFields),
            type: string(),
        }),
        program: string(),
        space: bigint(),
    });

// An account type implementing the account interface with a
// specified data encoding structure
const accountType = (
    name: string,
    description: string,
    data: { type: GraphQLScalarType | GraphQLObjectType }
): GraphQLObjectType =>
    new GraphQLObjectType({
        description,
        fields: {
            ...accountInterfaceFields,
            data,
            owner: {
                args: accountInputFields,
                resolve: (parent, args, context) => context.resolveAccount({ ...args, address: parent.owner }),
                type: accountInterface,
            },
        },
        interfaces: [accountInterface],
        name,
    });

/**
 * Account types for GraphQL
 */
export const accountTypes = [
    accountType('AccountBase58', 'A Solana account with base58 encoded data', string()),
    accountType('AccountBase64', 'A Solana account with base64 encoded data', string()),
    accountType('AccountBase64Zstd', 'A Solana account with base64 encoded data compressed with zstd', string()),
    accountType(
        'MintAccount',
        'An SPL mint',
        accountDataJsonParsed('Mint', {
            decimals: number(),
            freezeAuthority: string(),
            isInitialized: boolean(),
            mintAuthority: string(),
            supply: string(),
        })
    ),
    accountType(
        'TokenAccount',
        'An SPL token account',
        accountDataJsonParsed('TokenAccount', {
            isNative: boolean(),
            mint: string(),
            owner: string(),
            state: string(),
            tokenAmount: type(tokenAmountType),
        })
    ),
    accountType(
        'NonceAccount',
        'A nonce account',
        accountDataJsonParsed('Nonce', {
            authority: string(),
            blockhash: string(),
            feeCalculator: object('NonceFeeCalculator', {
                lamportsPerSignature: string(),
            }),
        })
    ),
    accountType(
        'StakeAccount',
        'A stake account',
        accountDataJsonParsed('Stake', {
            meta: object('StakeMeta', {
                authorized: object('StakeMetaAuthorized', {
                    staker: string(),
                    withdrawer: string(),
                }),
                lockup: object('StakeMetaLockup', {
                    custodian: string(),
                    epoch: bigint(),
                    unixTimestamp: bigint(),
                }),
                rentExemptReserve: string(),
            }),
            stake: object('StakeStake', {
                creditsObserved: bigint(),
                delegation: object('StakeStakeDelegation', {
                    activationEpoch: bigint(),
                    deactivationEpoch: bigint(),
                    stake: string(),
                    voter: string(),
                    warmupCooldownRate: number(),
                }),
            }),
        })
    ),
    accountType(
        'VoteAccount',
        'A vote account',
        accountDataJsonParsed('Vote', {
            authorizedVoters: list(
                object('VoteAuthorizedVoter', {
                    authorizedVoter: string(),
                    epoch: bigint(),
                })
            ),
            authorizedWithdrawer: string(),
            commission: number(),
            epochCredits: list(
                object('VoteEpochCredits', {
                    credits: string(),
                    epoch: bigint(),
                    previousCredits: string(),
                })
            ),
            lastTimestamp: object('VoteLastTimestamp', {
                slot: bigint(),
                timestamp: bigint(),
            }),
            nodePubkey: string(),
            priorVoters: list(string()),
            rootSlot: bigint(),
            votes: list(
                object('VoteVote', {
                    confirmationCount: number(),
                    slot: bigint(),
                })
            ),
        })
    ),
    accountType(
        'LookupTableAccount',
        'An address lookup table account',
        accountDataJsonParsed('LookupTable', {
            addresses: list(string()),
            authority: string(),
            deactivationSlot: string(),
            lastExtendedSlot: string(),
            lastExtendedSlotStartIndex: number(),
        })
    ),
];
