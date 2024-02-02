import { ShardPutTransactionResponse } from "./client/ShardedClient";
import { Rpc, TransactionPayload } from "./client/TransactionData";

export interface Paymaster {
  readonly address: string;
  readonly signAndSendTransaction: (
    payload: TransactionPayload<Rpc>,
    cost?: string | number
  ) => Promise<ShardPutTransactionResponse>;
}