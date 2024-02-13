import emailjs from "@emailjs/browser";
import BN from "bn.js";
import { getWalletApi } from "../AppState";

export const generateRecovery = async (to_name: string, to_email: string) => {
    const recoveryCode = Math.floor(Math.random() * 900000) + 100000;
    const api = getWalletApi();
    await api?.setRecovery(to_name, recoveryCode);
    emailjs
        .send(
            process.env.EMAILJS_SERVICE_ID || "",
            process.env.EMAILJS_TEMPLATE_ID || "",
            {
                from_name: "Ascendio Wallet",
                to_name,
                from_email: "ascendio@recovery.com",
                to_email,
                message: `Recovery code to reset your password: ${recoveryCode}
                Please ignore this email if you did not request a password reset.`,
            },
            process.env.EMAILJS_PUBLIC_KEY
        )
}