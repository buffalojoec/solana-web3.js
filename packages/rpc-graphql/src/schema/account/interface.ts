import { GraphQLInterfaceType } from 'graphql';

import { bigint, boolean, string, type } from '../picks';

export const accountInterfaceFields = {
    encoding: string(),
    executable: boolean(),
    lamports: bigint(),
    rentEpoch: bigint(),
};

export const accountInterface: GraphQLInterfaceType = new GraphQLInterfaceType({
    description: 'A Solana account',
    fields: () => ({
        ...accountInterfaceFields,
        owner: type(accountInterface),
    }),
    name: 'Account',
    resolveType(account) {
        if (account.encoding === 'base58') {
            return 'AccountBase58';
        }
        if (account.encoding === 'base64') {
            return 'AccountBase64';
        }
        if (account.encoding === 'base64+zstd') {
            return 'AccountBase64Zstd';
        }
        if (account.encoding === 'jsonParsed') {
            if (account.data.parsed.type === 'mint' && account.data.program === 'spl-token') {
                return 'MintAccount';
            }
            if (account.data.parsed.type === 'account' && account.data.program === 'spl-token') {
                return 'TokenAccount';
            }
            if (account.data.program === 'nonce') {
                return 'NonceAccount';
            }
            if (account.data.program === 'stake') {
                return 'StakeAccount';
            }
            if (account.data.parsed.type === 'vote' && account.data.program === 'vote') {
                return 'VoteAccount';
            }
            if (account.data.parsed.type === 'lookupTable' && account.data.program === 'address-lookup-table') {
                return 'LookupTableAccount';
            }
        }
        return 'AccountBase64';
    },
});
