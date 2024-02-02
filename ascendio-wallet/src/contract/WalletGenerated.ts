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
    "5042434142490b000005040000000009010000000850617373436f6465000000020000000870617373776f72640a00000004636f646508010000000850617373776f7264000000010000000870617373776f72640a0100000004436f64650000000100000004636f646508010000000e536563726574526573706f6e7365000000010000000b7374617475735f636f6465060100000008526573706f6e7365000000010000000b7374617475735f636f646506010000000d436f6e747261637453746174650000000700000009757365726e616d65730e0b0000000777616c6c6574730f0b000600000005636f6465730f0b0006000000087265636f766572790f0b0b0000000666726f7a656e0f0b0c0000000f667265657a655f6475726174696f6e0f0b030000000c667265657a655f73746172740f0b03010000000b536563726574566172496400000001000000067261775f69640301000000134576656e74537562736372697074696f6e496400000001000000067261775f696408010000000f45787465726e616c4576656e74496400000001000000067261775f6964080000000a010000000a696e697469616c697a65ffffffff0f00000000170000000d6372656174655f77616c6c6574400000000200000008757365726e616d650b000000087265636f766572790b0000000c7365637265745f696e7075740001170000000c7365745f7265636f76657279410000000100000008757365726e616d650b0000000c7365637265745f696e707574000217000000077265636f766572420000000100000008757365726e616d650b0000000c7365637265745f696e7075740000170000001073656e645f7472616e73616374696f6e430000000400000008757365726e616d650b00000007616464726573730d00000006616d6f756e740500000009726563697069656e740b0000000c7365637265745f696e7075740001170000000d667265657a655f77616c6c657444000000010000000f667265657a655f6475726174696f6e030000000c7365637265745f696e707574000102000000086465667265657a65010000000100000008757365726e616d650b110000000f696e7075747465645f7365637265748dadb9ae0e000000001300000010636f6d707574655f636f6d706c657465b3dd9c7400000000140000000d6f70656e5f7661726961626c6583bbf9bc09000000000005",
    "hex"
)).parseAbi();

type Option<K> = K | undefined;

export interface PassCode {
    password: BN;
    code: number;
}

export function newPassCode(password: BN, code: number): PassCode {
    return { password, code };
}

function fromScValuePassCode(structValue: ScValueStruct): PassCode {
    return {
        password: structValue.getFieldValue("password")!.asBN(),
        code: structValue.getFieldValue("code")!.asNumber(),
    };
}

export interface Password {
    password: BN;
}

export function newPassword(password: BN): Password {
    return { password };
}

function fromScValuePassword(structValue: ScValueStruct): Password {
    return {
        password: structValue.getFieldValue("password")!.asBN(),
    };
}

export interface Code {
    code: number;
}

export function newCode(code: number): Code {
    return { code };
}

function fromScValueCode(structValue: ScValueStruct): Code {
    return {
        code: structValue.getFieldValue("code")!.asNumber(),
    };
}

export interface SecretResponse {
    statusCode: number;
}

export function newSecretResponse(statusCode: number): SecretResponse {
    return { statusCode };
}

function fromScValueSecretResponse(structValue: ScValueStruct): SecretResponse {
    return {
        statusCode: structValue.getFieldValue("status_code")!.asNumber(),
    };
}

export interface Response {
    statusCode: number;
}

export function newResponse(statusCode: number): Response {
    return { statusCode };
}

function fromScValueResponse(structValue: ScValueStruct): Response {
    return {
        statusCode: structValue.getFieldValue("status_code")!.asNumber(),
    };
}

export interface ContractState {
    usernames: string[];
    wallets: Map<string, SecretVarId>;
    codes: Map<string, SecretVarId>;
    recovery: Map<string, string>;
    frozen: Map<string, boolean>;
    freezeDuration: Map<string, number>;
    freezeStart: Map<string, number>;
}

export function newContractState(usernames: string[], wallets: Map<string, SecretVarId>, codes: Map<string, SecretVarId>, recovery: Map<string, string>, frozen: Map<string, boolean>, freezeDuration: Map<string, number>, freezeStart: Map<string, number>): ContractState {
    return { usernames, wallets, codes, recovery, frozen, freezeDuration, freezeStart };
}

function fromScValueContractState(structValue: ScValueStruct): ContractState {
    return {
        usernames: structValue.getFieldValue("usernames")!.vecValue().values().map((sc1) => sc1.stringValue()),
        wallets: new Map([...structValue.getFieldValue("wallets")!.mapValue().map].map(([k2, v3]) => [k2.stringValue(), fromScValueSecretVarId(v3.structValue())])),
        codes: new Map([...structValue.getFieldValue("codes")!.mapValue().map].map(([k4, v5]) => [k4.stringValue(), fromScValueSecretVarId(v5.structValue())])),
        recovery: new Map([...structValue.getFieldValue("recovery")!.mapValue().map].map(([k6, v7]) => [k6.stringValue(), v7.stringValue()])),
        frozen: new Map([...structValue.getFieldValue("frozen")!.mapValue().map].map(([k8, v9]) => [k8.stringValue(), v9.boolValue()])),
        freezeDuration: new Map([...structValue.getFieldValue("freeze_duration")!.mapValue().map].map(([k10, v11]) => [k10.stringValue(), v11.asNumber()])),
        freezeStart: new Map([...structValue.getFieldValue("freeze_start")!.mapValue().map].map(([k12, v13]) => [k12.stringValue(), v13.asNumber()])),
    };
}

export function deserializeContractState(state: StateBytes): ContractState {
    const scValue = new StateReader(state.state, fileAbi.contract, state.avlTrees).readState();
    return fromScValueContractState(scValue);
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

export function initialize(): Buffer {
    const fnBuilder = new FnRpcBuilder("initialize", fileAbi.contract);
    return fnBuilder.getBytes();
}

export function defreeze(username: string): Buffer {
    const fnBuilder = new FnRpcBuilder("defreeze", fileAbi.contract);
    fnBuilder.addString(username);
    return fnBuilder.getBytes();
}