export type ContractType = "PUBLIC";

export interface ContractCore {
    type: ContractType;
    address: string;
    jarHash: string;
    storageLength: number;
    abi: string;
}

export type ContractData<T> = ContractCore & { serializedContract: T };