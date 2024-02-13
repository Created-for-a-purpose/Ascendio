import { getRequest } from "./BaseClient";
import { Buffer } from "buffer";

export class AvlClient {
    private readonly host: string;
    private readonly shards: string[];

    constructor(host: string, shards: string[]) {
        this.host = host;
        this.shards = shards;
    }

    public getContractState(address: string): Promise<Buffer | undefined> {
        return getRequest<Buffer>(this.contractStateQueryUrl(address) + "?stateOutput=binary");
    }

    public async getContractStateAvlValue(
        address: string,
        treeId: number,
        key: Buffer
    ): Promise<Buffer | undefined> {
        const data = await getRequest<{ data: string }>(
            `${this.contractStateQueryUrl(address)}/avl/${treeId}/${key.toString("hex")}`
        );
        return data === undefined ? undefined : Buffer.from(data.data, "base64");
    }

    public getContractStateAvlNextN(
        address: string,
        treeId: number,
        key: Buffer | undefined,
        n: number
    ): Promise<Array<Record<string, string>> | undefined> {
        if (key === undefined) {
            return getRequest<Array<Record<string, string>>>(
                `${this.contractStateQueryUrl(address)}/avl/${treeId}/next?n=${n}`
            );
        } else {
            return getRequest<Array<Record<string, string>>>(
                `${this.contractStateQueryUrl(address)}/avl/${treeId}/next/${key.toString("hex")}?n=${n}`
            );
        }
    }

    private contractStateQueryUrl(address: string): string {
        return `${this.host}/shards/${this.shardForAddress(address)}/blockchain/contracts/${address}`;
    }

    private shardForAddress(address: string): string {
        const numOfShards = this.shards.length;
        const buffer = Buffer.from(address, "hex");
        const shardIndex = Math.abs(buffer.readInt32BE(17)) % numOfShards;
        return this.shards[shardIndex];
    }
}