import BN from "bn.js";
import { AvlClient } from "../client/AvlClient";
import { LittleEndianByteInput } from "@secata-public/bitmanipulation-ts";
import { Buffer } from "buffer";


const AVL_CLIENT = new AvlClient("https://node1.testnet.partisiablockchain.com", [
    "Shard0",
    "Shard1",
    "Shard2",
]);

export const TokenV2AvlApi = {
    getBalance: async (contractAddress: string, key: string) => {
        const keyBytes = Buffer.from(key, "hex");
        const value = await AVL_CLIENT.getContractStateAvlValue(contractAddress, 0, keyBytes);
        if (value === undefined) {
            throw new Error("Undefined value");
        }
        return new LittleEndianByteInput(value).readUnsignedBigInteger(16);
    },

    getNextTenBalances: async (
        contractAddress: string,
        keyAddress: string | undefined
    ): Promise<Array<[string, BN]>> => {
        const keyBytes = keyAddress === undefined ? undefined : Buffer.from(keyAddress, "hex");
        const values = await AVL_CLIENT.getContractStateAvlNextN(contractAddress, 0, keyBytes, 10);
        if (values === undefined) {
            throw new Error("Undefined value");
        }
        return values.map((val) => {
            const tuple = Object.entries(val)[0];
            return [
                Buffer.from(tuple[0], "base64").toString("hex"),
                new LittleEndianByteInput(Buffer.from(tuple[1], "base64")).readUnsignedBigInteger(16),
            ];
        });
    },
};