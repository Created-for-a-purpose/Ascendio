import { ContractAbi, FnRpcBuilder, ZkInputBuilder } from "@partisiablockchain/abi-client";
import {
    ZkRpcBuilder,
    BlockchainAddress,
    BlockchainPublicKey,
} from "@partisiablockchain/zk-client";
import { Buffer } from "buffer";
import { TransactionApi } from "../client/TransactionApi";
import { newPassword, defreeze } from "./WalletGenerated";
import { getContractAddress } from "../AppState";
import BN from "bn.js";

export class WalletApi {
    private readonly transactionApi: TransactionApi;
    private readonly sender: BlockchainAddress;
    private readonly abi: ContractAbi;
    private readonly engineKeys: BlockchainPublicKey[];

    constructor(
        transactionApi: TransactionApi,
        sender: string,
        abi: ContractAbi,
        engineKeys: BlockchainPublicKey[]
    ) {
        this.transactionApi = transactionApi;
        this.sender = BlockchainAddress.fromString(sender);
        this.abi = abi;
        this.engineKeys = engineKeys.map((key) => BlockchainPublicKey.fromBuffer(key.asBuffer()));
    }

    readonly createWallet = (password: BN, username: string, recovery: string) => {
        if (username === "" || recovery === "") return Promise.reject("Username and recovery mail cannot be empty");
        const address = getContractAddress();
        if (address === undefined) {
            throw new Error("Contract address is not set");
        }
        const fnBuilder = new FnRpcBuilder("create_wallet", this.abi);
        fnBuilder.addString(username);
        fnBuilder.addString(recovery);
        const publicRpc = fnBuilder.getBytes()
        const secretInputBuilder = ZkInputBuilder.createZkInputBuilder("create_wallet", this.abi);
        const structBuilder = secretInputBuilder.addStruct();
        structBuilder.addI128(new BN(password))
        const compactBitArray = secretInputBuilder.getBits()
        const rpc = ZkRpcBuilder.zkInputOnChain(
            this.sender,
            compactBitArray,
            publicRpc,
            this.engineKeys,
        )

        return this.transactionApi.sendTransactionAndWait(address, rpc, 100_000);
    }

    readonly sendTransaction = (username: string, amount: BN, recipientUsername: string, password: BN) => {
        const address = getContractAddress();
        if (address === undefined) {
            throw new Error("Contract address is not set");
        }
        const tokenAddress = "028ee0ad1c1a13277b900b6e5bcbfbe082569180f0"
        const fnBuilder = new FnRpcBuilder("send_transaction", this.abi);
        fnBuilder.addString(username);
        fnBuilder.addAddress(tokenAddress);
        fnBuilder.addU128(new BN(amount.toString()));
        fnBuilder.addString(recipientUsername);
        const publicRpc = fnBuilder.getBytes()
        const secretInputBuilder = ZkInputBuilder.createZkInputBuilder("send_transaction", this.abi);
        const structBuilder = secretInputBuilder.addStruct();
        structBuilder.addI128(new BN(password))
        const compactBitArray = secretInputBuilder.getBits()
        const rpc = ZkRpcBuilder.zkInputOnChain(
            this.sender,
            compactBitArray,
            publicRpc,
            this.engineKeys,
        )

        return this.transactionApi.sendTransactionAndWait(address, rpc, 1_000_000);
    }

    readonly setRecovery = (username: string, code: number) => {
        const address = getContractAddress();
        if (address === undefined) {
            throw new Error("Contract address is not set");
        }
        const fnBuilder = new FnRpcBuilder("set_recovery", this.abi);
        fnBuilder.addString(username);
        const publicRpc = fnBuilder.getBytes()
        const secretInputBuilder = ZkInputBuilder.createZkInputBuilder("set_recovery", this.abi);
        const structBuilder = secretInputBuilder.addStruct();
        structBuilder.addI32(code)
        const compactBitArray = secretInputBuilder.getBits()
        const rpc = ZkRpcBuilder.zkInputOnChain(
            this.sender,
            compactBitArray,
            publicRpc,
            this.engineKeys,
        )

        return this.transactionApi.sendTransactionAndWait(address, rpc, 100_000);
    }

    readonly recover = (username: string, password: BN, recovery: number) => {
        const address = getContractAddress();
        if (address === undefined) {
            throw new Error("Contract address is not set");
        }
        const fnBuilder = new FnRpcBuilder("recover", this.abi);
        fnBuilder.addString(username);
        const publicRpc = fnBuilder.getBytes()
        const secretInputBuilder = ZkInputBuilder.createZkInputBuilder("recover", this.abi);
        const structBuilder = secretInputBuilder.addStruct();
        structBuilder.addI128(new BN(password))
        structBuilder.addI32(recovery)
        const compactBitArray = secretInputBuilder.getBits()
        const rpc = ZkRpcBuilder.zkInputOnChain(
            this.sender,
            compactBitArray,
            publicRpc,
            this.engineKeys,
        )

        return this.transactionApi.sendTransactionAndWait(address, rpc, 1_000_000);
    }

    readonly freeze = (username: string, duration: number, password: string) => {
        const address = getContractAddress();
        if (address === undefined) {
            throw new Error("Contract address is not set");
        }
        const fnBuilder = new FnRpcBuilder("freeze_wallet", this.abi);
        fnBuilder.addString(username);
        fnBuilder.addU32(duration);
        const publicRpc = fnBuilder.getBytes()
        const secretInputBuilder = ZkInputBuilder.createZkInputBuilder("freeze_wallet", this.abi);
        const structBuilder = secretInputBuilder.addStruct();
        structBuilder.addI128(new BN(password))
        const compactBitArray = secretInputBuilder.getBits()
        const rpc = ZkRpcBuilder.zkInputOnChain(
            this.sender,
            compactBitArray,
            publicRpc,
            this.engineKeys,
        )

        return this.transactionApi.sendTransactionAndWait(address, rpc, 1_000_000);
    }
}