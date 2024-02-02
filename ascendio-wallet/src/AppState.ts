import { ContractAbi } from "@partisiablockchain/abi-client";
import { BlockchainPublicKey } from "@partisiablockchain/zk-client";
import { ShardedClient } from "./client/ShardedClient";
import { TransactionApi } from "./client/TransactionApi";
import { Paymaster } from "./Paymaster";
import { WalletApi } from "./contract/WalletApi";
import { updateContractState } from "./PaymasterExecution";

export const CLIENT = new ShardedClient("https://node1.testnet.partisiablockchain.com", [
    "Shard0",
    "Shard1",
    "Shard2",
]);

let contractAddress: string | undefined;
let paymaster: Paymaster | undefined;
let contractAbi: ContractAbi | undefined;
let walletApi: WalletApi | undefined;
let engineKeys: BlockchainPublicKey[] | undefined;

export const setPaymaster = (_paymaster: Paymaster | undefined) => {
    paymaster = _paymaster;
    setWalletApi();
};

export const setContractAbi = (abi: ContractAbi | undefined) => {
    contractAbi = abi;
    setWalletApi();
};

export const getContractAbi = () => {
    return contractAbi;
};

export const setWalletApi = () => {
    if (paymaster != undefined && contractAbi != undefined && engineKeys !== undefined) {
        const transactionApi = new TransactionApi(paymaster, updateContractState);
        walletApi = new WalletApi(
            transactionApi,
            paymaster.address,
            contractAbi,
            engineKeys
        );
    }
};

export const getWalletApi = () => {
    return walletApi;
};

export const getEngineKeys = () => {
    return engineKeys;
};

export const setEngineKeys = (keys: BlockchainPublicKey[] | undefined) => {
    engineKeys = keys;
    setWalletApi();
};

export const getContractAddress = () => {
    return contractAddress;
};

export const setContractAddress = (address: string) => {
    contractAddress = address;
};