import { AccountData } from "./AccountData";
import { getRequest } from "./BaseClient";
import { ContractCore, ContractData } from "./ContractData";
import { ExecutedTransactionDto } from "./TransactionData";

/**
 * Web client that can get data from PBC.
 */
export class PbcClient {
    readonly host: string;

    constructor(host: string) {
        this.host = host;
    }

    public getContractData<T>(
        address: string,
        withState = true
    ): Promise<ContractCore | ContractData<T> | undefined> {
        const query = "?requireContractState=" + withState;
        return getRequest(this.host + "/blockchain/contracts/" + address + query);
    }

    public getAccountData(address: string): Promise<AccountData | undefined> {
        return getRequest<AccountData>(this.host + "/blockchain/account/" + address).then(
            (response?: AccountData) => {
                if (response != null) {
                    response.address = address;
                }
                return response;
            }
        );
    }

    public getExecutedTransaction(
        identifier: string,
        requireFinal = true
    ): Promise<ExecutedTransactionDto | undefined> {
        const query = "?requireFinal=" + requireFinal;
        return getRequest(this.host + "/blockchain/transaction/" + identifier + query);
    }
}