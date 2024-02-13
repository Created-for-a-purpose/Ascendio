import { useState, useEffect } from 'react'
import '../styles/Wallet.css'
import { getWalletApi } from '../AppState';
import BN from 'bn.js';
const copy = 'https://i.imgur.com/HfIWAiz.png'

interface WalletProps {
    username: string;
    password: string;
}

function Wallet({ username, password }: WalletProps) {
    const [sendForm, setSendForm] = useState(false);
    const [freezeForm, setFreezeForm] = useState(false);
    const [txHash, setTxHash] = useState('')

    useEffect(() => {
        async function loadState() {
        }
        loadState()
    }, [])

    const copyUsername = () => {
        navigator.clipboard.writeText(username)
            .catch(err => console.error("Error copying username: ", err));
    }

    const send = async (e: any) => {
        e.preventDefault();
        const to = e.target.elements.to.value;
        const amount = e.target.elements.amount.value;
        const api = getWalletApi();
        const response = await api?.sendTransaction(username, amount, to, new BN(password))
        if (response === undefined) {
            console.log('Error sending transaction');
            return;
        }
        setTxHash(response);

        setTimeout(() => {
            setSendForm(false);
            setFreezeForm(false);
            setTxHash('');
        }, 4000);
    }

    const freeze = async (e: any) => {
        e.preventDefault();
        const duration = e.target.elements.duration.value;
        console.log('Freezing wallet for ', duration, ' days');
        const api = getWalletApi();
        const response = await api?.freeze(username, duration, password);
        if (response === undefined) {
            console.log('Error freezing wallet');
            return;
        }
        setTxHash(response);

        setTimeout(() => {
            setSendForm(false);
            setFreezeForm(false);
            setTxHash('');
        }, 4000);
    }

    return (
        <>
            {
                !sendForm && !freezeForm && <>
                    <div className="username">Username: {username}<button onClick={copyUsername}>
                        <img src={copy} alt="" className='copy-icon' />
                    </button>
                    </div>
                    <div className="balance">
                        Token Balance
                        <h1>100 MPC</h1>
                    </div>
                    <button className="button" onClick={() => setSendForm(true)}>Send 📤</button>
                    <button className="button" onClick={() => setFreezeForm(true)}>Freeze 🥶</button>
                    <button className="button" onClick={() => null}>Defreeze ♨️</button>
                </>
            }
            {
                sendForm && <>
                    <div className="username form-header">Send MPC tokens</div>
                    <form onSubmit={(e) => send(e)}>
                        <div className="form-group">
                            <label htmlFor="to" className='form-label'>To</label>
                            <input type="text" id="to" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="amount" className='form-label'>Amount</label>
                            <input type="number" id="amount" />
                        </div>
                        <button type="submit" className="create-button">Send</button>
                        {txHash && <div className='tx-link'>
                            <div
                                onClick={(e) => { e.stopPropagation(); window.open(`https://browser.testnet.partisiablockchain.com/transactions/${txHash}`, '_blank', 'width=800,height=600') }}>
                                ✅ Sent: Visit explorer
                            </div>
                        </div>}
                    </form>
                </>
            }
            {
                freezeForm && <>
                    <div className="username form-header">Freeze your wallet
                        <br /><br />⚠️ Irreversible action</div>
                    <form onSubmit={(e) => freeze(e)}>
                        <div className="form-group">
                            <label htmlFor="duration" className='form-label'>Duration (days)</label>
                            <input type="number" id="duration" />
                        </div>
                        <button type="submit" className="create-button">Freeze</button>
                        {txHash && <div className='tx-link'>
                            <a href={`https://browser.testnet.partisiablockchain.com/transactions/${txHash}`} target='_blank'
                                onClick={(e) => { e.stopPropagation() }}>
                                ✅ Frozen: Visit explorer</a>
                        </div>}
                    </form>
                </>
            }
        </>
    )
}

export default Wallet