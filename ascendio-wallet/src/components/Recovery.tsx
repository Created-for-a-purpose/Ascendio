import emailjs from "@emailjs/browser";

export const generateRecovery = async (to_name: string, to_email: string) => {
    const recoveryCode = Math.floor(Math.random() * 900000) + 100000;
    await sendZkInput(recoveryCode);
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

const sendZkInput = async (recoveryCode: number) => {

}