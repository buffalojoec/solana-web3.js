import {
    GetAccountInfoApi,
    GetBlockApi,
    GetMultipleAccountsApi,
    GetProgramAccountsApi,
    GetTransactionApi,
    Rpc,
} from '@solana/rpc';
import type { Slot } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createRpcGraphQL, RpcGraphQL } from '../index';
import {
    createLocalhostSolanaRpc,
    mockBlockFull,
    mockBlockFullBase58,
    mockBlockFullBase64,
    mockBlockSignatures,
    mockRpcResponse,
} from './__setup__';

describe('block', () => {
    let rpc: Rpc<GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi>;
    let rpcGraphQL: RpcGraphQL;

    // Random slot for testing.
    // Not actually used. Just needed for proper query parsing.
    const slot = 511226n as Slot;

    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createLocalhostSolanaRpc();
        rpcGraphQL = createRpcGraphQL(rpc);
    });
    // The `block` query takes a `BigInt` as a parameter. We need to test this
    // for various input types that might occur outside of a JavaScript
    // context, such as string or number.
    describe('bigint parameter', () => {
        const source = /* GraphQL */ `
            query testQuery($block: Slot!) {
                block(slot: $block) {
                    blockhash
                }
            }
        `;
        it('can accept a bigint parameter', async () => {
            expect.assertions(2);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFull)));
            const variables = { block: 511226n };
            const result = await rpcGraphQL.query(source, variables);
            expect(result).not.toHaveProperty('errors');
            expect(result).toMatchObject({
                data: {
                    block: {
                        blockhash: expect.any(String),
                    },
                },
            });
        });
        it('can accept a number parameter', async () => {
            expect.assertions(2);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFull)));
            const variables = { block: 511226 };
            const result = await rpcGraphQL.query(source, variables);
            expect(result).not.toHaveProperty('errors');
            expect(result).toMatchObject({
                data: {
                    block: {
                        blockhash: expect.any(String),
                    },
                },
            });
        });
        it('can accept a string parameter', async () => {
            expect.assertions(2);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFull)));
            const variables = { block: '511226' };
            const result = await rpcGraphQL.query(source, variables);
            expect(result).not.toHaveProperty('errors');
            expect(result).toMatchObject({
                data: {
                    block: {
                        blockhash: expect.any(String),
                    },
                },
            });
        });
    });
    describe('basic queries', () => {
        it("can query a block's block time", async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFull)));
            const source = /* GraphQL */ `
                query testQuery($slot: Slot!) {
                    block(slot: $slot) {
                        blockTime
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { slot });
            expect(result).toMatchObject({
                data: {
                    block: {
                        blockTime: expect.any(BigInt),
                    },
                },
            });
        });
        it('can query multiple fields on a block', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFull)));
            const source = /* GraphQL */ `
                query testQuery($slot: Slot!) {
                    block(slot: $slot) {
                        blockhash
                        parentSlot
                        rewards {
                            pubkey
                            lamports
                            postBalance
                            rewardType
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { slot });
            expect(result).toMatchObject({
                data: {
                    block: {
                        blockhash: expect.any(String),
                        parentSlot: expect.any(BigInt),
                        rewards: expect.arrayContaining([
                            {
                                lamports: expect.any(BigInt),
                                postBalance: expect.any(BigInt),
                                pubkey: expect.any(String),
                                rewardType: expect.any(String),
                            },
                        ]),
                    },
                },
            });
        });
        it("can query a block's transaction signatures", async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockSignatures))); // TODO: Mocks
            const source = /* GraphQL */ `
                query testQuery($slot: Slot!) {
                    block(slot: $slot) {
                        signatures
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { slot });
            expect(result).toMatchObject({
                data: {
                    block: {
                        signatures: expect.any(Array),
                    },
                },
            });
        });
        it("can query a block's transaction data as `base58`", async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFullBase58))); // TODO: Mocks
            const source = /* GraphQL */ `
                query testQuery($slot: Slot!) {
                    block(slot: $slot) {
                        transactions {
                            data(encoding: BASE_58)
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { slot });
            expect(result).toMatchObject({
                data: {
                    block: {
                        transactions: expect.arrayContaining([
                            {
                                data: expect.any(String),
                            },
                        ]),
                    },
                },
            });
        });
        it("can query a block's transaction data as `base64`", async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFullBase64))); // TODO: Mocks
            const source = /* GraphQL */ `
                query testQuery($slot: Slot!) {
                    block(slot: $slot) {
                        transactions {
                            data(encoding: BASE_64)
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { slot });
            expect(result).toMatchObject({
                data: {
                    block: {
                        transactions: expect.arrayContaining([
                            {
                                data: expect.any(String),
                            },
                        ]),
                    },
                },
            });
        });
        it("can query a block's parsed transaction message", async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFull)));
            const source = /* GraphQL */ `
                query testQuery($slot: Slot!) {
                    block(slot: $slot) {
                        transactions {
                            message {
                                accountKeys {
                                    pubkey
                                    signer
                                    writable
                                }
                                recentBlockhash
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { slot });
            expect(result).toMatchObject({
                data: {
                    block: {
                        transactions: expect.arrayContaining([
                            {
                                message: {
                                    accountKeys: expect.any(Array),
                                    recentBlockhash: expect.any(String),
                                },
                            },
                        ]),
                    },
                },
            });
        });
    });
    describe('specific instruction types', () => {
        describe('instructions', () => {
            it('can query a block with a transaction containing a `GenericInstruction` instruction', async () => {
                expect.assertions(1);
                fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFull)));
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            transactions {
                                message {
                                    instructions {
                                        ... on GenericInstruction {
                                            accounts
                                            data
                                            programId
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { slot });
                expect(result).toMatchObject({
                    data: {
                        block: {
                            transactions: expect.arrayContaining([
                                {
                                    message: {
                                        instructions: expect.arrayContaining([
                                            {
                                                accounts: expect.any(Array),
                                                data: expect.any(String),
                                                programId: expect.any(String),
                                            },
                                        ]),
                                    },
                                },
                            ]),
                        },
                    },
                });
            });
            it('can query a block with a transaction containing a `ExtendLookupTable` instruction', async () => {
                expect.assertions(1);
                fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFull)));
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            transactions {
                                message {
                                    instructions {
                                        programId
                                        ... on ExtendLookupTableInstruction {
                                            lookupTableAccount {
                                                address
                                            }
                                            lookupTableAuthority {
                                                address
                                            }
                                            newAddresses
                                            payerAccount {
                                                address
                                            }
                                            systemProgram {
                                                address
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { slot });
                expect(result).toMatchObject({
                    data: {
                        block: {
                            transactions: expect.arrayContaining([
                                {
                                    message: {
                                        instructions: expect.arrayContaining([
                                            {
                                                lookupTableAccount: {
                                                    address: expect.any(String),
                                                },
                                                lookupTableAuthority: {
                                                    address: expect.any(String),
                                                },
                                                newAddresses: expect.any(Array),
                                                payerAccount: {
                                                    address: expect.any(String),
                                                },
                                                programId: 'AddressLookupTab1e1111111111111111111111111',
                                                systemProgram: {
                                                    address: expect.any(String),
                                                },
                                            },
                                        ]),
                                    },
                                },
                            ]),
                        },
                    },
                });
            });
            it('can query a block with a transaction containing a `CreateAccount` instruction', async () => {
                expect.assertions(1);
                fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFull)));
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            transactions {
                                message {
                                    instructions {
                                        programId
                                        ... on CreateAccountInstruction {
                                            lamports
                                            newAccount {
                                                address
                                            }
                                            owner {
                                                address
                                            }
                                            source {
                                                address
                                            }
                                            space
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { slot });
                expect(result).toMatchObject({
                    data: {
                        block: {
                            transactions: expect.arrayContaining([
                                {
                                    message: {
                                        instructions: expect.arrayContaining([
                                            {
                                                lamports: expect.any(BigInt),
                                                newAccount: {
                                                    address: expect.any(String),
                                                },
                                                owner: {
                                                    address: expect.any(String),
                                                },
                                                programId: '11111111111111111111111111111111',
                                                source: {
                                                    address: expect.any(String),
                                                },
                                                space: expect.any(BigInt),
                                            },
                                        ]),
                                    },
                                },
                            ]),
                        },
                    },
                });
            });
            it('can query a block with a transaction containing a `SplMemoInstruction` instruction', async () => {
                expect.assertions(1);
                fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFull)));
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            transactions {
                                message {
                                    instructions {
                                        programId
                                        ... on SplMemoInstruction {
                                            memo
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { slot });
                expect(result).toMatchObject({
                    data: {
                        block: {
                            transactions: expect.arrayContaining([
                                {
                                    message: {
                                        instructions: expect.arrayContaining([
                                            {
                                                memo: 'fb_07ce1448',
                                                programId: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
                                            },
                                        ]),
                                    },
                                },
                            ]),
                        },
                    },
                });
            });
            it('can query a block with a transaction containing a `SplTokenInitializeMintInstruction` instruction', async () => {
                expect.assertions(1);
                fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFull)));
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            transactions {
                                message {
                                    instructions {
                                        programId
                                        ... on SplTokenInitializeMintInstruction {
                                            decimals
                                            freezeAuthority {
                                                address
                                            }
                                            mint {
                                                address
                                            }
                                            mintAuthority {
                                                address
                                            }
                                            rentSysvar {
                                                address
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { slot });
                expect(result).toMatchObject({
                    data: {
                        block: {
                            transactions: expect.arrayContaining([
                                {
                                    message: {
                                        instructions: expect.arrayContaining([
                                            {
                                                decimals: expect.any(BigInt),
                                                freezeAuthority: {
                                                    address: expect.any(String),
                                                },
                                                mint: {
                                                    address: expect.any(String),
                                                },
                                                mintAuthority: {
                                                    address: expect.any(String),
                                                },
                                                programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                                rentSysvar: { address: expect.any(String) },
                                            },
                                        ]),
                                    },
                                },
                            ]),
                        },
                    },
                });
            });
        });
        describe('inner instructions', () => {
            it('can query a block with a transaction containing a `Allocate` inner instruction', async () => {
                expect.assertions(1);
                fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFull)));
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            transactions {
                                meta {
                                    innerInstructions {
                                        instructions {
                                            programId
                                            ... on AllocateInstruction {
                                                account {
                                                    address
                                                }
                                                space
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { slot });
                expect(result).toMatchObject({
                    data: {
                        block: {
                            transactions: expect.arrayContaining([
                                {
                                    meta: {
                                        innerInstructions: expect.arrayContaining([
                                            {
                                                instructions: expect.arrayContaining([
                                                    {
                                                        account: {
                                                            address: expect.any(String),
                                                        },
                                                        programId: '11111111111111111111111111111111',
                                                        space: expect.any(BigInt),
                                                    },
                                                ]),
                                            },
                                        ]),
                                    },
                                },
                            ]),
                        },
                    },
                });
            });
            it('can query a block with a transaction containing a `Assign` inner instruction', async () => {
                expect.assertions(1);
                fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFull)));
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            transactions {
                                meta {
                                    innerInstructions {
                                        instructions {
                                            programId
                                            ... on AssignInstruction {
                                                account {
                                                    address
                                                }
                                                owner {
                                                    address
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { slot });
                expect(result).toMatchObject({
                    data: {
                        block: {
                            transactions: expect.arrayContaining([
                                {
                                    meta: {
                                        innerInstructions: expect.arrayContaining([
                                            {
                                                instructions: expect.arrayContaining([
                                                    {
                                                        account: {
                                                            address: expect.any(String),
                                                        },
                                                        owner: {
                                                            address: expect.any(String),
                                                        },
                                                        programId: '11111111111111111111111111111111',
                                                    },
                                                ]),
                                            },
                                        ]),
                                    },
                                },
                            ]),
                        },
                    },
                });
            });
            it('can query a block with a transaction containing a `Transfer` inner instruction', async () => {
                expect.assertions(1);
                fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFull)));
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            transactions {
                                meta {
                                    innerInstructions {
                                        instructions {
                                            programId
                                            ... on TransferInstruction {
                                                destination {
                                                    address
                                                }
                                                lamports
                                                source {
                                                    address
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { slot });
                expect(result).toMatchObject({
                    data: {
                        block: {
                            transactions: expect.arrayContaining([
                                {
                                    meta: {
                                        innerInstructions: expect.arrayContaining([
                                            {
                                                instructions: expect.arrayContaining([
                                                    {
                                                        destination: {
                                                            address: expect.any(String),
                                                        },
                                                        lamports: expect.any(BigInt),
                                                        programId: '11111111111111111111111111111111',
                                                        source: {
                                                            address: expect.any(String),
                                                        },
                                                    },
                                                ]),
                                            },
                                        ]),
                                    },
                                },
                            ]),
                        },
                    },
                });
            });
            it('can query a block with a transaction containing a `SplTokenTransfer` inner instruction', async () => {
                expect.assertions(1);
                fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFull)));
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            transactions {
                                meta {
                                    innerInstructions {
                                        instructions {
                                            programId
                                            ... on SplTokenTransferInstruction {
                                                amount
                                                destination {
                                                    address
                                                }
                                                source {
                                                    address
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { slot });
                expect(result).toMatchObject({
                    data: {
                        block: {
                            transactions: expect.arrayContaining([
                                {
                                    meta: {
                                        innerInstructions: expect.arrayContaining([
                                            {
                                                instructions: expect.arrayContaining([
                                                    {
                                                        amount: expect.any(String),
                                                        destination: {
                                                            address: expect.any(String),
                                                        },
                                                        programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                                        source: {
                                                            address: expect.any(String),
                                                        },
                                                    },
                                                ]),
                                            },
                                        ]),
                                    },
                                },
                            ]),
                        },
                    },
                });
            });
        });
    });
});
