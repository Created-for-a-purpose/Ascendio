import '../styles/Wallet.css'
const copy = 'https://i.imgur.com/HfIWAiz.png'

interface WalletProps {
    username: string;
}

function Wallet({ username }: WalletProps) {
    const copyUsername = () => {
        navigator.clipboard.writeText(username)
            .catch(err => console.error("Error copying username: ", err));
    }

    return (
        <>
            <div className="username">Username: {username}<button onClick={copyUsername}>
                <img src={copy} alt="" className='copy-icon' />
            </button>
            </div>
            <div className="balance">
                Token Balance
                <h1>100 MPC</h1>
            </div>
            <button className="button" onClick={() => null}>Send</button>
            <button className="button" onClick={() => null}>Freeze</button>
            <button className="button" onClick={() => null}>Deposit</button>
        </>
    )
}

export default Wallet