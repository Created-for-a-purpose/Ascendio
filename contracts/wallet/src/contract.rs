#[macro_use]
extern crate pbc_contract_codegen;
extern crate pbc_contract_common;

use create_type_spec_derive::CreateTypeSpec;
use pbc_contract_common::address::{Shortname, Address};
use pbc_contract_common::context::ContractContext;
use pbc_contract_common::events::EventGroup;
use pbc_contract_common::sorted_vec_map::SortedVecMap;
use pbc_contract_common::zk::{CalculationStatus, SecretVarId, ZkInputDef, ZkState, ZkStateChange, ZkClosed};
use pbc_zk::Sbi32;
use pbc_traits::ReadWriteState;
use read_write_state_derive::ReadWriteState;
use read_write_rpc_derive::ReadRPC;
use crate::zk_compute::PassCode;
use crate ::zk_compute::Password;
use crate ::zk_compute::Code;
mod zk_compute;

/// Secret variable metadata. Indicates if the variable is a vote or the number of counted yes votes
#[derive(ReadWriteState, Debug)]
#[repr(C)]
struct SecretVarMetadata {
    variable_type: SecretVarType,
    username: String,
    address: Address,
    amount: u128,
    recipient: String,
    freeze: u32,
}

#[derive(ReadWriteState, Debug, PartialEq)]
#[repr(u8)]
enum SecretVarType {
    Password = 1,
    Code = 2,
    PassCode = 3,
    Tx = 4,
    Freeze = 5
}

#[derive(ReadWriteState, CreateTypeSpec, ReadRPC, Clone)]
#[repr(C)]
pub struct Response {
   pub status_code: i8
}

/// This contract's state
#[state]
struct ContractState {
    usernames: Vec<String>,
    wallets: SortedVecMap<String, SecretVarId>,
    codes: SortedVecMap<String, SecretVarId>,
    recovery: SortedVecMap<String, String>,
    frozen: SortedVecMap<String, bool>,
    freeze_duration: SortedVecMap<String, u32>,
    freeze_start: SortedVecMap<String, u32>
}

#[init(zk = true)]
pub fn initialize(
    ctx: ContractContext,
    _zk_state: ZkState<SecretVarMetadata>
) -> ContractState {
    ContractState {
        usernames: vec![],
        wallets: SortedVecMap::new(),
        codes: SortedVecMap::new(),
        recovery: SortedVecMap::new(),
        frozen: SortedVecMap::new(),
        freeze_duration: SortedVecMap::new(),
        freeze_start: SortedVecMap::new()
    }
}

#[zk_on_secret_input(shortname = 0x40, secret_type="Password")]
pub fn create_wallet(
    context: ContractContext,
    mut state: ContractState,
    zk_state: ZkState<SecretVarMetadata>,
    username: String,
    recovery: String
) -> (
    ContractState,
    Vec<EventGroup>,
    ZkInputDef<SecretVarMetadata, Password>,
) {
    if state.wallets.contains_key(&username) {
        panic!("Username exists");
    }
    state.wallets.insert(username.clone(), SecretVarId::new(0));
    state.recovery.insert(username.clone(), recovery.clone());
    state.frozen.insert(username.clone(), false);
    state.freeze_duration.insert(username.clone(), 0);
    state.freeze_start.insert(username.clone(), 0);
    
    let input_def = ZkInputDef::with_metadata(SecretVarMetadata {
        variable_type: SecretVarType::Password,
        username: username.clone(),
        address: context.sender,
        amount: 0,
        recipient: String::default(),
        freeze: 0
    });
    (state, vec![], input_def)
}

#[zk_on_secret_input(shortname = 0x41, secret_type="Code")]
pub fn set_recovery(
    context: ContractContext,
    mut state: ContractState,
    zk_state: ZkState<SecretVarMetadata>,
    username: String
) -> (
    ContractState,
    Vec<EventGroup>,
    ZkInputDef<SecretVarMetadata, Code>,
) {
    if !state.wallets.contains_key(&username) {
        panic!("Username does not exist");
    }
    state.codes.insert(username.clone(), SecretVarId::new(0));

    let input_def = ZkInputDef::with_metadata(SecretVarMetadata {
        variable_type: SecretVarType::Code,
        username: username.clone(),
        address: context.sender,
        amount: 0,
        recipient: String::default(),
        freeze: 0
    });
    (state, vec![], input_def)
}

#[zk_on_secret_input(shortname = 0x42, secret_type="PassCode")]
pub fn recover(
    context: ContractContext,
    state: ContractState,
    zk_state: ZkState<SecretVarMetadata>,
    username: String
) -> (
    ContractState,
    Vec<EventGroup>,
    ZkInputDef<SecretVarMetadata, PassCode>,
) {
    let input_def = ZkInputDef::with_metadata(SecretVarMetadata {
        variable_type: SecretVarType::PassCode,
        username: username.clone(),
        address: context.sender,
        amount: 0,
        recipient: String::default(),
        freeze: 0
    });
    (state, vec![], input_def)
}

#[zk_on_secret_input(shortname = 0x43, secret_type="Password")]
fn send_transaction(
    context: ContractContext,
    mut state: ContractState,
    zk_state: ZkState<SecretVarMetadata>,
    username: String,
    address: Address,   // address of MPC20
    amount: u128,
    recipient: String
) -> (
    ContractState,
    Vec<EventGroup>,
    ZkInputDef<SecretVarMetadata, Password>,
) {
    if !state.wallets.contains_key(&username) {
        panic!("Username does not exist");
    }

    let isFrozen = *state.frozen.get(&username).unwrap();
    assert_eq!(isFrozen, false, "Wallet is frozen, defreeze to continue");

    let input_def = ZkInputDef::with_metadata(SecretVarMetadata {
        variable_type: SecretVarType::Tx,
        username: username.clone(),
        address: address.clone(),
        amount: amount.clone(),
        recipient: recipient.clone(),
        freeze: 0
    });
    (state, vec![], input_def)
}

#[zk_on_secret_input(shortname = 0x44, secret_type="Password")]
pub fn freeze_wallet(
    ctx: ContractContext,
    mut state: ContractState,
    _zk_state: ZkState<SecretVarMetadata>,
    freeze_duration: u32
) -> (
    ContractState,
    Vec<EventGroup>,
    ZkInputDef<SecretVarMetadata, Password>,
) {
    let input_def = ZkInputDef::with_metadata(SecretVarMetadata {
        variable_type: SecretVarType::Freeze,
        username: String::default(),
        address: ctx.sender,
        amount: 0,
        recipient: String::default(),
        freeze: freeze_duration
    });
    (state, vec![], input_def)
}      

#[action(shortname=0x01, zk=true)]
pub fn defreeze(
    ctx: ContractContext,
    mut state: ContractState,
    _zk_state: ZkState<SecretVarMetadata>,
    username: String
) -> ContractState {
   let isFrozen = *state.frozen.get(&username).unwrap();
    assert_eq!(isFrozen, true, "Wallet is not frozen");

    let freeze_start = *state.freeze_start.get(&username).unwrap();
    let freeze_duration = *state.freeze_duration.get(&username).unwrap();
    let freeze_end = freeze_start + freeze_duration;
    let current_time = ctx.block_production_time;

    assert!(i64::from(freeze_end) < current_time, "Wallet is still frozen");

    state.frozen.insert(username.clone(), false);
    state.freeze_duration.insert(username.clone(), 0);
    state.freeze_start.insert(username.clone(), 0);

    state
}

#[zk_on_variable_inputted]
fn inputted_secret(
    context: ContractContext,
    mut state: ContractState,
    zk_state: ZkState<SecretVarMetadata>,
    secret_id: SecretVarId,
) -> (ContractState, Vec<EventGroup>, Vec<ZkStateChange>) {
    let secret_metadata = zk_state
            .secret_variables
            .get(&secret_id)
            .unwrap()
            .metadata;
    let secret_type = secret_metadata.variable_type;
    let username = secret_metadata.username;
    match secret_type {
        SecretVarType::Password => {
            state.wallets.insert(username, secret_id);
        },
        SecretVarType::Code => {
            state.codes.insert(username, secret_id);
        },
        SecretVarType::PassCode => {
            let pass_id = *state.wallets.get(&username).unwrap();
            let code_id = *state.codes.get(&username).unwrap();

            if pass_id == SecretVarId::new(0) || code_id == SecretVarId::new(0) {
                panic!("Passcode not set or code not generated");
            }

            return (
                state,
                vec![],
                vec![zk_compute::secret_process_start(
                    secret_id,
                    pass_id,
                    code_id,
                    &SecretVarType::Code,
                )],
            );
        }, 
        SecretVarType::Tx => {
            let pass_id = *state.wallets.get(&username).unwrap();

            if pass_id == SecretVarId::new(0) {
                panic!("Passcode not set or code not generated");
            }

            return (
                state,
                vec![],
                vec![zk_compute::secret_matcher_start(
                    secret_id,
                    pass_id,
                    &SecretVarType::Code,
                )],
            );
        },
        SecretVarType::Freeze => {
            let pass_id = *state.wallets.get(&username).unwrap();
            if pass_id == SecretVarId::new(0) {
                panic!("Passcode not set");
            }
            return (
                state,
                vec![],
                vec![zk_compute::secret_matcher_start(
                    secret_id,
                    pass_id,
                    &SecretVarType::Code,
                )],
            );
        }
    }
    (
        state,
        vec![],
        vec![],
    )
}

#[zk_on_compute_complete]
fn compute_complete (
    context: ContractContext,
    state: ContractState,
    zk_state: ZkState<SecretVarMetadata>,
    output_variables: Vec<SecretVarId>
) -> (ContractState, Vec<EventGroup>, Vec<ZkStateChange>) {
    (
        state,
        vec![],
        vec![ZkStateChange::OpenVariables {
            variables: output_variables,
        }],
    )
}

#[zk_on_variables_opened]
fn open_variable (
    context: ContractContext,
    mut state: ContractState,
    zk_state: ZkState<SecretVarMetadata>,
    opened_variables: Vec<SecretVarId>
) -> (ContractState, Vec<EventGroup>, Vec<ZkStateChange>) {
assert_eq!(
    opened_variables.len(),
    1,
    "Unexpected number of output variables"
);
let variable_id = opened_variables.get(0).unwrap();
let result: Response = read_variable(&zk_state, variable_id).unwrap();

if result.status_code == 0 {
    panic!("Incorrect code");
}

let variable_metadata = zk_state.get_variable(*variable_id).unwrap().metadata;
let variable_type = variable_metadata.variable_type;

match variable_type {
    SecretVarType::Tx => {
        let address: Address = variable_metadata.address;
        let recipient: String = variable_metadata.recipient;
        let amount: u128 = variable_metadata.amount;
        let username: String = variable_metadata.username;

        let mut event_builder = EventGroup::builder();
        event_builder
        .call(address, Shortname::from_u32(1))
        .argument(username)
        .argument(recipient)
        .argument(amount)
        .done();

        let zk_state_changes = vec![ZkStateChange::ContractDone];
        return (
            state,
            vec![event_builder.build()],
            zk_state_changes
        );
    },
    SecretVarType::Freeze => {
        let freeze_duration: u32 = variable_metadata.freeze;
        let freeze_start: u32 = context.block_production_time.try_into().unwrap();
        let username: String = variable_metadata.username;

        state.frozen.insert(username.clone(), true);
        state.freeze_duration.insert(username.clone(), freeze_duration);
        state.freeze_start.insert(username.clone(), freeze_start);
    },
    SecretVarType::PassCode => {},
    SecretVarType::Code => {},
    SecretVarType::Password => {}
}

let zk_state_changes = vec![ZkStateChange::ContractDone];
(state, vec![], zk_state_changes)
}

fn read_variable<T: ReadWriteState>(
    zk_state: &ZkState<SecretVarMetadata>,
    variable_id: &SecretVarId,
) -> Option<T> {
    let variable = zk_state.get_variable(*variable_id)?;
    variable.open_value()
}