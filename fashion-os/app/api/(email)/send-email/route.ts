import { NextResponse } from "next/server";
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const { to, subject, text, html } = await request.json();

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT),
            secure: false,
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_SERVER_USER,
            to,
            subject,
            text,
            html
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
    } catch (error) {
        console.error("Failed to send email:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}