import { CLIENT } from "../AppState";
import { Paymaster } from "../Paymaster";
import { ShardId } from "./TransactionData";

export type CallbackPromise = Promise<string>;

export class TransactionApi {
    public static readonly TRANSACTION_TTL: number = 60_000;
    private static readonly DELAY_BETWEEN_RETRIES = 1_000;
    private static readonly MAX_TRIES = TransactionApi.TRANSACTION_TTL / this.DELAY_BETWEEN_RETRIES;
    private readonly paymaster: Paymaster;
    private readonly fetchUpdatedState: () => void;

    constructor(paymaster: Paymaster, fetch: () => void) {
        this.paymaster = paymaster;
        this.fetchUpdatedState = fetch;
    }

    public readonly sendTransactionAndWait = (
        address: string,
        rpc: Buffer,
        gasCost: number
    ): CallbackPromise => {
        return this.paymaster
            .signAndSendTransaction(
                {
                    rpc,
                    address,
                },
                gasCost
            )
            .then((putResponse) => {
                if (putResponse.putSuccessful) {
                    return this.waitForTransaction(putResponse.shard, putResponse.transactionHash)
                        .then(() => {
                            this.fetchUpdatedState();
                            return putResponse.transactionHash;
                        })
                        .catch((reason) => {
                            throw reason;
                        });
                } else {
                    throw new Error("Transaction could not be sent");
                }
            });
    };

    private readonly delay = (millis: number): Promise<unknown> => {
        return new Promise((resolve) => setTimeout(resolve, millis));
    };

    private readonly waitForTransaction = (
        shard: ShardId,
        identifier: string,
        tryCount = 0
    ): Promise<void> => {
        return CLIENT.getExecutedTransaction(shard, identifier).then((executedTransaction) => {
            if (executedTransaction == null) {
                if (tryCount >= TransactionApi.MAX_TRIES) {
                    throw new Error(
                        'Transaction "' + identifier + '" not finalized at shard "' + shard + '"'
                    );
                } else {
                    return this.delay(TransactionApi.DELAY_BETWEEN_RETRIES).then(() =>
                        this.waitForTransaction(shard, identifier, tryCount + 1)
                    );
                }
            } else if (!executedTransaction.executionSucceeded) {
                throw new Error('Transaction "' + identifier + '" failed at shard "' + shard + '"');
            } else {
                return Promise.all(
                    executedTransaction.events.map((e) =>
                        this.waitForTransaction(e.destinationShard, e.identifier)
                    )
                ).then(() => undefined);
            }
        });
    };
}