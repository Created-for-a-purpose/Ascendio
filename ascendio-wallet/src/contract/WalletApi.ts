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
        const address = getContractAddress();
        if (address === undefined) {
            throw new Error("Contract address is not set");
        }
        const fnBuilder = new FnRpcBuilder("create_wallet", this.abi);
        fnBuilder.addString(username);
        fnBuilder.addString(recovery);
        const publicRpc = fnBuilder.getBytes()

        const secretInputBuilder = ZkInputBuilder.createZkInputBuilder("create_wallet", this.abi);
        // const Password = newPassword(password);
        secretInputBuilder.addI128(password);
        const compactBitArray = secretInputBuilder.getBits()

        const rpc = ZkRpcBuilder.zkInputOnChain(
            this.sender,
            compactBitArray,
            publicRpc,
            this.engineKeys,
        )

        return this.transactionApi.sendTransactionAndWait(address, rpc, 100_000);
    }
}