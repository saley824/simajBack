import argon2 from "argon2";
import crypto from "crypto";
import nodemailer from "nodemailer";

interface Options {
    email: string;
    subject: string;
    token: string;
}

// ----------------------------EMAIL SENDING-----------------------------------
const sendEmail = async (options: Options, name: String) => {
    const emailUsername: string = process.env.EMAIL_USERNAME!;
    const emailPassword = process.env.EMAIL_PASSWORD!;
    const emailPort = process.env.EMAIL_PORT!;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: parseInt(emailPort),
        auth: {
            user: emailUsername,
            pass: emailPassword,
        },
    });

    const htmlContent = `
<p>Poštovani <strong>${name}</strong>,</p>
<p>Primili smo zahtjev za resetovanje šifre za Vaš nalog.</p>
<p>Molimo vas da koristite sljedeći token za resetovanje šifre:</p>
<p><span style="font-size: 32px; background-color: #f0f0f0; padding: 5px 10px; border-radius: 4px;">${options.token}</span></p>
<p>Token ističe za  10 minuta.</p>
<p>Srdačan pozdrav,</p>
<p><strong>Eagro Tim</strong></p>
`;
    const mailOptions = {
        from: emailUsername,
        to: options.email,
        subject: options.subject,
        html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
};

// ----------------------------CREATE HASH PASSWORD-----------------------------------
const hashPassword = async (password: string) => {
    return await argon2.hash(password);
};

// ----------------------------VERIFY PASSWORD-----------------------------------
const compare = async (password: string, candidate: string) => {
    return await argon2.verify(password, candidate);
};

// ----------------------------CREATE PASSWORD TOKEN-----------------------------------
const createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(3).toString("hex");

    const hashResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const now = new Date();
    const tokenExpires = new Date(now.getTime() + 10 * 60000);

    return { resetToken, hashResetToken, tokenExpires };
};

export default {
    hashPassword,
    compare,
    createPasswordResetToken,
    sendEmail,
};
