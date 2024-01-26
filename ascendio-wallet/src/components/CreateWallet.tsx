import React, { useState } from 'react';
import '../styles/CreateWallet.css';
const horse = "https://static.displate.com/1200x857/displate/2021-05-19/5b04b27618cb89016642bf525ef89f5f_fbe0de8b9a372a20f0116b5f95905c8a.jpg"

function CreateWallet() {
    const [createForm, setCreateForm] = useState(false);
    const [importForm, setImportForm] = useState(false);

    const handleCreateWallet = () => {
        setCreateForm(true);
        // Logic for creating a new wallet
    };

    const handleImportExisting = () => {
        setImportForm(true);
        // Logic for importing an existing wallet
    };

    return (
        <div className="wallet-extension">
            <h1 className="wallet-header">⚡Ascendio Wallet</h1>
            {
                !createForm && !importForm && <>
                    <img src={horse} alt='' className='' />
                    <div className="button-container">
                        <button className="wallet-button" onClick={handleCreateWallet}>Create new wallet</button>
                        <button className="wallet-button" onClick={handleImportExisting}>Import existing wallet</button>
                    </div>
                </>
            }
            {
                createForm &&
                <div className='create-form'>
                    <h1 className='form-header'>Setup your wallet</h1>
                    <form onSubmit={(e) => null}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input type="text" id="username" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" />
                        </div>
                        <button type="submit" className="create-button">Create</button>
                    </form>
                </div>
            }
        </div>
    );
}

export default CreateWallet