import { AbiParser } from "@partisiablockchain/abi-client";
import { Buffer } from "buffer";
import {
    CLIENT,
    setPaymaster,
    getContractAbi,
    setContractAbi,
    getEngineKeys,
    setEngineKeys,
    getContractAddress
} from "./AppState";
import { BlockchainPublicKey, CryptoUtils } from "@partisiablockchain/zk-client";
import { TransactionApi } from "./client/TransactionApi";
import { serializeTransaction } from "./client/TransactionSerialization";
import { Paymaster } from "./Paymaster";
import { deserializeContractState } from "./contract/WalletGenerated";
import { BigEndianByteOutput } from "@secata-public/bitmanipulation-ts";
import { Rpc, TransactionPayload } from "./client/TransactionData";
import { ec } from "elliptic";

const connectPaymaster = async (sender: string, keyPair: ec.KeyPair): Promise<Paymaster> => {
    return {
        address: sender,
        signAndSendTransaction: (payload: TransactionPayload<Rpc>, cost = 0) => {
            return CLIENT.getAccountData(sender).then((accountData) => {
                if (accountData == null) {
                    throw new Error("Account data was null");
                }

                const serializedTx = serializeTransaction(
                    {
                        cost: String(cost),
                        nonce: accountData.nonce,
                        validTo: String(new Date().getTime() + TransactionApi.TRANSACTION_TTL),
                    },
                    payload
                );
                const hash = CryptoUtils.hashBuffers([
                    serializedTx,
                    BigEndianByteOutput.serialize((out) => out.writeString("Partisia Blockchain Testnet")),
                ]);
                const signature = keyPair.sign(hash);

                // Serialize transaction for sending
                const transactionPayload = Buffer.concat([
                    CryptoUtils.signatureToBuffer(signature),
                    serializedTx,
                ]);

                // Send the transaction to the blockchain
                return CLIENT.putTransaction(transactionPayload).then((txPointer) => {
                    if (txPointer != null) {
                        return {
                            putSuccessful: true,
                            shard: txPointer.destinationShardId,
                            transactionHash: txPointer.identifier,
                        };
                    } else {
                        return { putSuccessful: false };
                    }
                });
            });
        },
    };
};

export const inititatePaymaster = () => {
    const privateKey = process.env.PAYMASTER_KEY
    if (privateKey === undefined) {
        throw new Error("Failed to initialize paymaster!");
    }
    const keyPair = CryptoUtils.privateKeyToKeypair(privateKey);
    const sender = CryptoUtils.keyPairToAccountAddress(keyPair);
    connectPaymaster(sender, keyPair).then(
        (paymaster) => {
            setPaymaster(paymaster);
        },
        (err) => {
            console.error(err);
        }
    );
};

/**
 * Structure of the raw data from a ZK WASM contract.
 */
interface RawZkContractData {
    engines: { engines: Engine[] };
    openState: { openState: { data: string } };
    variables: Array<{ key: number; value: ZkVariable }>;
}

/** dto of an engine in the zk contract object. */
interface Engine {
    /** Address of the engine. */
    identity: string;
    /** Public key of the engine encoded in base64. */
    publicKey: string;
    /** Rest interface of the engine. */
    restInterface: string;
}

/** A subset of a Zk variable on chain. */
interface ZkVariable {
    id: number;
    information: { data: string };
    owner: string;
    transaction: string;
}

/**
 * Write some of the state to the UI.
 */
export const updateContractState = () => {
    const address = getContractAddress();

    if (address === undefined) {
        throw new Error("No address provided");
    }

    return CLIENT.getContractData<RawZkContractData>(address).then((contract) => {
        if (contract != null) {
            // Parses the contract abi
            if (getContractAbi() === undefined) {
                const abiBuffer = Buffer.from(contract.abi, "base64");
                const abi = new AbiParser(abiBuffer).parseAbi();
                setContractAbi(abi.contract);
            }

            // Gets the public keys of the zk nodes attached to this contract.
            if (getEngineKeys() === undefined) {
                const engineKeys = contract.serializedContract.engines.engines.map((e) =>
                    BlockchainPublicKey.fromBuffer(Buffer.from(e.publicKey, "base64"))
                );
                setEngineKeys(engineKeys);
            }

            // Reads the state of the contract
            const stateBuffer = Buffer.from(
                contract.serializedContract.openState.openState.data,
                "base64"
            );

            const state = deserializeContractState({ state: stateBuffer });
            return state;
        } else {
            throw new Error("Could not find data for contract");
        }
    });
};