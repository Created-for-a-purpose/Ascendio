import { useState } from 'react'
import '../styles/Wallet.css'
const copy = 'https://i.imgur.com/HfIWAiz.png'

interface WalletProps {
    username: string;
}

function Wallet({ username }: WalletProps) {
    const [sendForm, setSendForm] = useState(false);
    const [freezeForm, setFreezeForm] = useState(false);
    const [txHash, setTxHash] = useState('')

    const copyUsername = () => {
        navigator.clipboard.writeText(username)
            .catch(err => console.error("Error copying username: ", err));
    }

    const send = (e: any) => {
        e.preventDefault();
        const to = e.target.elements.to.value;
        const amount = e.target.elements.amount.value;
        setTxHash('0x1234567890');

        setTimeout(() => {
            setSendForm(false);
            setFreezeForm(false);
            setTxHash('');
        }, 4000);
    }

    const freeze = (e: any) => {
        e.preventDefault();
        const duration = e.target.elements.duration.value;
        setTxHash('0x1234567890');

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
                    <button className="button" onClick={() => null}>Deposit 📩</button>
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
                            <a href={`https://browser.testnet.partisiablockchain.com/transactions/${txHash}`} target='_blank'>
                                ✅ Sent: Visit explorer</a>
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
                            <label htmlFor="duration" className='form-label'>Duration</label>
                            <input type="number" id="duration" />
                        </div>
                        <button type="submit" className="create-button">Freeze</button>
                        {txHash && <div className='tx-link'>
                            <a href={`https://browser.testnet.partisiablockchain.com/transactions/${txHash}`} target='_blank'>
                                ✅ Frozen: Visit explorer</a>
                        </div>}
                    </form>
                </>
            }
        </>
    )
}

export default Wallet