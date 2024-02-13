/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import BN from "bn.js";
import {
    AbiParser,
    AbstractBuilder, BigEndianReader,
    FileAbi, FnKinds, FnRpcBuilder, RpcReader,
    ScValue,
    ScValueEnum, ScValueOption,
    ScValueStruct,
    StateReader, TypeIndex,
    StateBytes,
    BlockchainAddress
} from "@partisiablockchain/abi-client";
import { BigEndianByteOutput } from "@secata-public/bitmanipulation-ts";

const fileAbi: FileAbi = new AbiParser(Buffer.from(
    "5042434142490a020005040000000006010000000e416c6c6f7765644164647265737300000002000000056f776e65720b000000077370656e6465720b01000000085472616e736665720000000200000002746f0b00000006616d6f756e7405010000000a546f6b656e537461746500000008000000046e616d650b00000008646563696d616c73010000000673796d626f6c0b000000056f776e65720d00000010636f6e74726163745f616464726573730d0000000c746f74616c5f737570706c79050000000862616c616e636573190b0500000007616c6c6f77656419000005010000000b536563726574566172496400000001000000067261775f69640301000000134576656e74537562736372697074696f6e496400000001000000067261775f696408010000000f45787465726e616c4576656e74496400000001000000067261775f69640800000003010000000a696e697469616c697a65ffffffff0f0000000500000010636f6e74726163745f616464726573730d000000046e616d650b0000000673796d626f6c0b00000008646563696d616c73010000000c746f74616c5f737570706c790502000000087472616e7366657201000000030000000673656e6465720b00000002746f0b00000006616d6f756e740502000000147365745f636f6e74726163745f61646472657373020000000100000007616464726573730d0002",
    "hex"
)).parseAbi();

type Option<K> = K | undefined;

export interface AllowedAddress {
    owner: string;
    spender: string;
}

export function newAllowedAddress(owner: string, spender: string): AllowedAddress {
    return { owner, spender };
}

function fromScValueAllowedAddress(structValue: ScValueStruct): AllowedAddress {
    return {
        owner: structValue.getFieldValue("owner")!.stringValue(),
        spender: structValue.getFieldValue("spender")!.stringValue(),
    };
}

export interface Transfer {
    to: string;
    amount: BN;
}

export function newTransfer(to: string, amount: BN): Transfer {
    return { to, amount };
}

function fromScValueTransfer(structValue: ScValueStruct): Transfer {
    return {
        to: structValue.getFieldValue("to")!.stringValue(),
        amount: structValue.getFieldValue("amount")!.asBN(),
    };
}

export interface TokenState {
    name: string;
    decimals: number;
    symbol: string;
    owner: BlockchainAddress;
    contractAddress: BlockchainAddress;
    totalSupply: BN;
    balances: Option<Map<string, BN>>;
    allowed: Option<Map<AllowedAddress, BN>>;
}

export function newTokenState(name: string, decimals: number, symbol: string, owner: BlockchainAddress, contractAddress: BlockchainAddress, totalSupply: BN, balances: Option<Map<string, BN>>, allowed: Option<Map<AllowedAddress, BN>>): TokenState {
    return { name, decimals, symbol, owner, contractAddress, totalSupply, balances, allowed };
}

function fromScValueTokenState(structValue: ScValueStruct): TokenState {
    return {
        name: structValue.getFieldValue("name")!.stringValue(),
        decimals: structValue.getFieldValue("decimals")!.asNumber(),
        symbol: structValue.getFieldValue("symbol")!.stringValue(),
        owner: BlockchainAddress.fromBuffer(structValue.getFieldValue("owner")!.addressValue().value),
        contractAddress: BlockchainAddress.fromBuffer(structValue.getFieldValue("contract_address")!.addressValue().value),
        totalSupply: structValue.getFieldValue("total_supply")!.asBN(),
        balances: structValue.getFieldValue("balances")!.avlTreeMapValue().mapKeysValues((k1) => k1.stringValue(), (v2) => v2.asBN()),
        allowed: structValue.getFieldValue("allowed")!.avlTreeMapValue().mapKeysValues((k3) => fromScValueAllowedAddress(k3.structValue()), (v4) => v4.asBN()),
    };
}

export function deserializeTokenState(state: StateBytes): TokenState {
    const scValue = new StateReader(state.state, fileAbi.contract, state.avlTrees).readState();
    return fromScValueTokenState(scValue);
}

export interface SecretVarId {
    rawId: number;
}

export function newSecretVarId(rawId: number): SecretVarId {
    return { rawId };
}

function fromScValueSecretVarId(structValue: ScValueStruct): SecretVarId {
    return {
        rawId: structValue.getFieldValue("raw_id")!.asNumber(),
    };
}

export interface EventSubscriptionId {
    rawId: number;
}

export function newEventSubscriptionId(rawId: number): EventSubscriptionId {
    return { rawId };
}

function fromScValueEventSubscriptionId(structValue: ScValueStruct): EventSubscriptionId {
    return {
        rawId: structValue.getFieldValue("raw_id")!.asNumber(),
    };
}

export interface ExternalEventId {
    rawId: number;
}

export function newExternalEventId(rawId: number): ExternalEventId {
    return { rawId };
}

function fromScValueExternalEventId(structValue: ScValueStruct): ExternalEventId {
    return {
        rawId: structValue.getFieldValue("raw_id")!.asNumber(),
    };
}

export function initialize(contractAddress: BlockchainAddress, name: string, symbol: string, decimals: number, totalSupply: BN): Buffer {
    const fnBuilder = new FnRpcBuilder("initialize", fileAbi.contract);
    fnBuilder.addAddress(contractAddress.asBuffer());
    fnBuilder.addString(name);
    fnBuilder.addString(symbol);
    fnBuilder.addU8(decimals);
    fnBuilder.addU128(totalSupply);
    return fnBuilder.getBytes();
}

export function transfer(sender: string, to: string, amount: BN): Buffer {
    const fnBuilder = new FnRpcBuilder("transfer", fileAbi.contract);
    fnBuilder.addString(sender);
    fnBuilder.addString(to);
    fnBuilder.addU128(amount);
    return fnBuilder.getBytes();
}

export function setContractAddress(address: BlockchainAddress): Buffer {
    const fnBuilder = new FnRpcBuilder("set_contract_address", fileAbi.contract);
    fnBuilder.addAddress(address.asBuffer());
    return fnBuilder.getBytes();
}