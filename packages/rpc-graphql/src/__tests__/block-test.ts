import { createSolanaRpcApi, SolanaRpcMethods } from '@solana/rpc-core';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createRpcGraphQL, RpcGraphQL } from '../rpc';

describe('block', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    let rpcGraphQL: RpcGraphQL;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
        rpcGraphQL = createRpcGraphQL(rpc);
    });

    describe('basic queries', () => {
        const variableValues = {
            commitment: 'confirmed',
            slot: 0n,
        };
        it("can query a block's blockhash", async () => {
            expect.assertions(1);
            const source = `
                query testQuery($slot: String!) {
                    block(slot: $slot) {
                        blockhash
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        blockhash: expect.any(String),
                    },
                },
            });
        });
        it("can query a block's block height", async () => {
            expect.assertions(1);
            const source = `
                query testQuery($slot: String!, $commitment: Commitment) {
                    block(slot: $slot, commitment: $commitment) {
                        blockHeight
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        blockHeight: expect.any(BigInt),
                    },
                },
            });
        });
        it('can query multiple fields', async () => {
            expect.assertions(1);
            const source = `
                query testQuery($slot: String!, $commitment: Commitment) {
                    block(slot: $slot, commitment: $commitment) {
                        blockHeight
                        blockTime
                        blockhash
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        blockHeight: expect.any(BigInt),
                        blockTime: expect.any(Number),
                        blockhash: expect.any(String),
                    },
                },
            });
        });
    });
});
