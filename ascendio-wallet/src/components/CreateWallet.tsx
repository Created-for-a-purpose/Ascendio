import { useState, useEffect } from 'react';
import '../styles/CreateWallet.css';
import Wallet from './Wallet';
const horse = "https://static.displate.com/1200x857/displate/2021-05-19/5b04b27618cb89016642bf525ef89f5f_fbe0de8b9a372a20f0116b5f95905c8a.jpg"
import { getWalletApi, setContractAddress } from '../AppState';
import { updateContractState, getUserRecovery } from '../PaymasterExecution';
import { generateRecovery } from './Recovery';

function CreateWallet() {
    const [createForm, setCreateForm] = useState(false);
    const [importForm, setImportForm] = useState(false);
    const [recoveryForm, setRecoveryForm] = useState(false);
    const [created, setCreated] = useState(false);
    const [txHash, setTxHash] = useState('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    useEffect(() => {
        async function call() {
            setContractAddress('032c5baac4443ca1168d54667df4e9c82f1828a4e7');
            updateContractState()
        }
        call()
    }, []);

    const create = async (e: any) => {
        e.preventDefault();
        const username = e.target.elements.username.value;
        const password = e.target.elements.password.value
        const recovery = e.target.elements.recovery.value;
        setUsername(username);
        setPassword(password);
        const api = getWalletApi();
        const response = await api?.createWallet(password, username, recovery)
        if (response === undefined) {
            console.log('Error creating wallet');
            return;
        }
        setTxHash(response);
        setCreated(true);
        setTimeout(() => {
            setCreateForm(false);
        }, 4000);
    }

    const importWallet = async (e: any) => {
        e.preventDefault();
        const username = e.target.elements.username.value;
        const password = e.target.elements.password.value
        setUsername(username);
        setPassword(password);
        setImportForm(false);
        setCreated(true);
    };

    const recoverWallet = async (e: any) => {
        e.preventDefault();
        const password = e.target.elements.password.value;
        setPassword(password);
        const walletApi = getWalletApi();
        const response = await walletApi?.recover(
            username,
            e.target.elements.password.value,
            e.target.elements.code.value
        );
        if (response === undefined) {
            console.log('Error recovering wallet');
            return;
        }
        setTxHash(response);
        setImportForm(false);
        setRecoveryForm(false);
        setCreated(true);
    }

    const handleForgotPassword = async () => {
        const recovery = await getUserRecovery(username);
        if (recovery === undefined) {
            console.log('Error getting recovery code');
            return;
        }
        generateRecovery(username, recovery);
        setRecoveryForm(true)
    }

    return (
        <div className="wallet-extension">
            <h1 className="wallet-header">⚡Ascendio Wallet</h1>
            {
                !createForm && !importForm && !created && <>
                    <img src={horse} alt='' className='' />
                    <div className="button-container">
                        <button className="wallet-button" onClick={() => setCreateForm(true)}>Create new wallet</button>
                        <button className="wallet-button" onClick={() => setImportForm(true)}>Import existing wallet</button>
                    </div>
                </>
            }
            {
                createForm && !created &&
                <div className='create-form'>
                    <h1 className='form-header'>Setup your wallet</h1>
                    <form onSubmit={(e) => create(e)}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input type="text" id="username" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="recovery">Recovery</label>
                            <input type="text" id="recovery" />
                        </div>
                        <button type="submit" className="create-button">Create</button>
                    </form>
                </div>
            }
            {
                created && createForm &&
                <div className='created'>
                    <h1>Wallet created!</h1>
                    <h1>✅</h1>
                    <div className='created-link'>
                        <div
                            onClick={(e) => { e.stopPropagation(); window.open(`https://browser.testnet.partisiablockchain.com/transactions/${txHash}`, '_blank', 'width=800,height=600') }}>
                            Visit explorer
                        </div>
                    </div>
                </div>
            }
            {
                created && !createForm &&
                <Wallet username={username} password={password} />
            }
            {
                importForm &&
                (!recoveryForm ? (<div className='create-form'>
                    <h1 className='form-header'>Import your wallet</h1>
                    <form onSubmit={(e) => importWallet(e)}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input type="text" id="username" onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" />
                        </div>
                        <label onClick={handleForgotPassword} id='forgot'>Forgot password?</label>
                        <button type="submit" className="create-button">Import</button>
                    </form>
                </div>) : (
                    <div className='create-form'>
                        <h1 className='form-header'>Recover your wallet</h1>
                        <h3>A code is sent to your registered recovery email</h3>
                        <form onSubmit={(e) => recoverWallet(e)}>
                            <div className="form-group">
                                <label htmlFor="code">Code</label>
                                <input type="number" id="code" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">New Password</label>
                                <input type="password" id="password" />
                            </div>
                            <button type="submit" className="create-button">Recover</button>
                        </form>
                    </div>
                ))
            }
        </div>
    );
}

export default CreateWallet