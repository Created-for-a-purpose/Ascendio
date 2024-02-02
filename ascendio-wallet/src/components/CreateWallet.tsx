import { useState, useEffect } from 'react';
import '../styles/CreateWallet.css';
import Wallet from './Wallet';
const horse = "https://static.displate.com/1200x857/displate/2021-05-19/5b04b27618cb89016642bf525ef89f5f_fbe0de8b9a372a20f0116b5f95905c8a.jpg"
import { getWalletApi, setContractAddress } from '../AppState';
import { updateContractState } from '../PaymasterExecution';

function CreateWallet() {
    const [createForm, setCreateForm] = useState(false);
    const [importForm, setImportForm] = useState(false);
    const [created, setCreated] = useState(false);
    const [txHash, setTxHash] = useState('');
    const [username, setUsername] = useState<string>('');

    useEffect(() => {
        async function call() {
            setContractAddress('03efd71802975c05b2bd2b166fe60440bebcd26347');
            // const state = await updateContractState();
        }
        call()
    }, []);

    const handleImportExisting = () => {
        // Logic for importing an existing wallet
        setImportForm(true);
    };

    const create = async (e: any) => {
        e.preventDefault();
        const username = e.target.elements.username.value;
        const password = e.target.elements.password.value
        const recovery = e.target.elements.recovery.value;
        setUsername(username);
        // const api = getWalletApi();
        // const response = await api?.createWallet(password, username, recovery)
        // console.log('response', response);
        setCreated(true);
        setTimeout(() => {
            setCreateForm(false);
        }, 1000);
    }

    return (
        <div className="wallet-extension">
            <h1 className="wallet-header">⚡Ascendio Wallet</h1>
            {
                !createForm && !importForm && !created && <>
                    <img src={horse} alt='' className='' />
                    <div className="button-container">
                        <button className="wallet-button" onClick={() => setCreateForm(true)}>Create new wallet</button>
                        <button className="wallet-button" onClick={handleImportExisting}>Import existing wallet</button>
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
                        <a href={`https://browser.testnet.partisiablockchain.com/transactions/${txHash}`} target='_blank'>
                            Visit explorer</a>
                    </div>
                </div>
            }
            {
                created && !createForm &&
                <Wallet username={username} />
            }
        </div>
    );
}

export default CreateWallet