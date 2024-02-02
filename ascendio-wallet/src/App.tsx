import CreateWallet from "./components/CreateWallet"
import "./App.css"
import { useEffect } from "react"
import { inititatePaymaster } from "./PaymasterExecution"

function App() {
    useEffect(() => {
        inititatePaymaster()
    }, [])

    return (
        <div className="container">
            <CreateWallet />
        </div>
    )
}

export default App