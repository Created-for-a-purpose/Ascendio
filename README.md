# Ascendio Wallet
Traditional wallets require to store private keys and seed phrases. This can be very inconvenient and billions of dollars are lost due to private key loss.
Moreover, traditional wallets do not allow much control over funds, which was the reason of coining the concept 'Account abstraction'.

## About
Ascendio Wallet is a username password and smart contract based wallet allowing greater control over user funds and advanced features such as email recovery, freeze wallet, etc. User can choose a username and a password to create a wallet, and thereafter, the password is stored in the zk state. Whenver a user wants to send some tokens to another wallet, he just has to do a password verification to initiate the transaction. If password is correct, transaction will be executed. User also gives their recovery email, on which a secret code is sent. The secret code is also stored in zk state, so user puts the recovery code and new password, and the code is verified in zk, and password is updated. Wallet freeze means that nobody will be able to access wallet funds for a freeze period, this feature is also allowed.
User does not have to pay any gas for the above transactions, as a paymaster key is used to sponsor all the gas fee.

## Architecture
![AW](https://github.com/Created-for-a-purpose/Ascendio/assets/97793907/6243e2a9-6979-4708-9754-d9fe64d80a3c)

## Contract links
### Wallet (ZK contract)
https://browser.testnet.partisiablockchain.com/contracts/032c5baac4443ca1168d54667df4e9c82f1828a4e7
### MPC20 (Public contract)
https://browser.testnet.partisiablockchain.com/contracts/028ee0ad1c1a13277b900b6e5bcbfbe082569180f0
