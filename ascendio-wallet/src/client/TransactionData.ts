import { Buffer } from "buffer";

/**
 * This file specifies the data format for transactions, executed transactions and events.
 */
export interface TransactionInner {
  nonce: number;
  validTo: string;
  cost: string;
}

interface ExecutedTransactionDtoInner {
  transactionPayload: string;
  block: string;
  blockTime: number;
  productionTime: number;
  identifier: string;
  executionSucceeded: boolean;
  failureCause?: FailureCause;
  events: EventData[];
  finalized: boolean;
}

export type ExecutedEventTransactionDto = ExecutedTransactionDtoInner;

export interface ExecutedSignedTransactionDto extends ExecutedTransactionDtoInner {
  from: string;
  interactionJarHash: string;
}

export type ExecutedTransactionDto = ExecutedEventTransactionDto | ExecutedSignedTransactionDto;

export type TransactionPayload<PayloadT> = InteractWithContract & PayloadT;

export interface InteractWithContract {
  address: string;
}

export interface Rpc {
  rpc: Buffer;
}

export interface PutTransactionWasSuccessful {
  putSuccessful: true;
  transactionHash: string;
}

export interface PutTransactionWasUnsuccessful {
  putSuccessful: false;
}

export type ShardId = string | null;

export interface EventData {
  identifier: string;
  destinationShard: ShardId;
}

export interface FailureCause {
  errorMessage: string;
  stackTrace: string;
}

export interface TransactionPointer {
  identifier: string;
  destinationShardId: string;
}