import BN from "bn.js";
import { BufferWriter } from "./BufferWriter";
import { Rpc, TransactionInner, TransactionPayload } from "./TransactionData";

/**
 * Helper function to serialize a transaction into bytes.
 * @param inner the inner transaction
 * @param data the actual payload
 */
export function serializeTransaction(
  inner: TransactionInner,
  data: TransactionPayload<Rpc>
): Buffer {
  const bufferWriter = new BufferWriter();
  serializeTransactionInner(bufferWriter, inner);
  bufferWriter.writeHexString(data.address);
  bufferWriter.writeDynamicBuffer(data.rpc);
  return bufferWriter.toBuffer();
}

function serializeTransactionInner(bufferWriter: BufferWriter, inner: TransactionInner) {
  bufferWriter.writeLongBE(new BN(inner.nonce));
  bufferWriter.writeLongBE(new BN(inner.validTo));
  bufferWriter.writeLongBE(new BN(inner.cost));
}