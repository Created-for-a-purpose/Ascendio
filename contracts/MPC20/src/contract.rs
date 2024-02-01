#[macro_use]
extern crate pbc_contract_codegen;

use create_type_spec_derive::CreateTypeSpec;
use read_write_rpc_derive::ReadWriteRPC;
use std::ops::{Add, Sub};

use pbc_contract_common::address::{Address, AddressType};
use pbc_contract_common::avl_tree_map::AvlTreeMap;
use pbc_contract_common::context::ContractContext;
use pbc_traits::ReadWriteState;
use read_write_state_derive::ReadWriteState;

#[state]
pub struct TokenState {
    name: String,
    decimals: u8,
    symbol: String,
    owner: Address,
    total_supply: u128,
    balances: AvlTreeMap<String, u128>,
    allowed: AvlTreeMap<AllowedAddress, u128>,
}


#[derive(ReadWriteState, CreateTypeSpec, Eq, Ord, PartialEq, PartialOrd)]
pub struct AllowedAddress {
    owner: String,
    spender: String,
}

trait BalanceMap<K: Ord, V> {
    fn insert_balance(&mut self, key: K, value: V);
}

impl<V: Sub<V, Output = V> + PartialEq + Copy + ReadWriteState, K: ReadWriteState + Ord>
    BalanceMap<K, V> for AvlTreeMap<K, V>
{
    #[allow(clippy::eq_op)]
    fn insert_balance(&mut self, key: K, value: V) {
        let zero = value - value;
        if value == zero {
            self.remove(&key);
        } else {
            self.insert(key, value);
        }
    }
}

impl TokenState {
    pub fn balance_of(&self, owner: &String) -> u128 {
        self.balances.get(owner).unwrap_or(0)
    }
}

#[init]
pub fn initialize(
    ctx: ContractContext,
    name: String,
    symbol: String,
    decimals: u8,
    total_supply: u128,
) -> TokenState {
    let mut balances = AvlTreeMap::new();
    balances.insert_balance("DEPLOYER".to_string(), total_supply);

    TokenState {
        name,
        symbol,
        decimals,
        owner: ctx.sender,
        total_supply,
        balances,
        allowed: AvlTreeMap::new(),
    }
}

/// Represents the type of a transfer.
#[derive(ReadWriteRPC, CreateTypeSpec)]
pub struct Transfer {
    /// The address to transfer to.
    pub to: String,
    /// The amount to transfer.
    pub amount: u128,
}

#[action(shortname = 0x01)]
pub fn transfer(
    context: ContractContext,
    state: TokenState,
    sender: String,
    to: String,
    amount: u128,
) -> TokenState {
    let hex_address = hex_string_to_address(AddressType::ZkContract, "03efd71802975c05b2bd2b166fe60440bebcd26347").unwrap();
    
    if !(context.sender == hex_address || (sender == "DEPLOYER".to_string() && context.sender == state.owner)) {
        panic!("Only wallet or the deployer can call!");
    }

    core_transfer(sender, state, to, amount)
}

pub fn core_transfer(
    sender: String,
    mut state: TokenState,
    to: String,
    amount: u128,
) -> TokenState {
    let from_amount = state.balance_of(&sender);
    let o_new_from_amount = from_amount.checked_sub(amount);
    match o_new_from_amount {
        Some(new_from_amount) => {
            state.balances.insert_balance(sender, new_from_amount);
        }
        None => {
            panic!(
                "Insufficient funds for transfer: {}/{}",
                from_amount, amount
            );
        }
    }
    let to_amount = state.balance_of(&to);
    state.balances.insert_balance(to, to_amount.add(amount));
    state
}

fn hex_string_to_address(address_type: AddressType, hex_address: &str) -> Option<Address> {
    if hex_address.len() != 40 {
        return None; 
    }

    let mut identifier = [0u8; 20];
    for (i, chunk) in hex_address.as_bytes().chunks(2).enumerate() {
        let byte = u8::from_str_radix(std::str::from_utf8(chunk).unwrap(), 16).ok()?;
        identifier[i] = byte;
    }

    Some(Address {
        address_type,
        identifier,
    })
}