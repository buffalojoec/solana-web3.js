import { createRpcSubscriptionsApi, RpcSubscriptionsApi, RpcSubscriptionsApiMethods } from '../rpc-subscriptions-api';

type NftCollectionDetailsApiResponse = Readonly<{
    address: string;
    circulatingSupply: number;
    description: string;
    erc721: boolean;
    erc1155: boolean;
    genesisBlock: string;
    genesisTransaction: string;
    name: string;
    totalSupply: number;
}>;

interface NftCollectionDetailsApi extends RpcSubscriptionsApiMethods {
    qn_fetchNFTCollectionDetails(args: { contracts: string[] }): NftCollectionDetailsApiResponse;
}

type QuickNodeRpcMethods = NftCollectionDetailsApi;

createRpcSubscriptionsApi<QuickNodeRpcMethods>() satisfies RpcSubscriptionsApi<QuickNodeRpcMethods>;
