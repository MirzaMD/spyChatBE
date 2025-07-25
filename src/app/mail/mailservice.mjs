import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL,
        pass:process.env.E_PASSWORD
    }
});

export const MailSender=async(toMail,user)=>{
    const payload={
        from:process.env.EMAIL,
        to:toMail,
        subject:"🕵️ Welcome to Spy Chat - Your Secret Conversations Start Here!",
        text:`Hi ${user},

Welcome to Spy Chat, your new home for private and secure conversations.
We're thrilled to have you join our undercover community!

🔒 What you can expect:

End-to-end encrypted messages

Real-time chats

Sleek and stealthy design

Zero data leaks - 100% privacy-focused

To get started, simply log in and say hello. If you ever need help, we're just one message away.

Your journey into secure messaging begins now.
Ready to explore?

Stay sneaky,
The Spy Chat Team`
    }

    await transporter.sendMail(payload);
}