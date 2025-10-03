import argon2 from "argon2";
import crypto from "crypto";
import nodemailer from "nodemailer";

interface ResetPasswordOptions {
    email: string;
    subject: string;
    token: string;
}
interface VerifyEmailOptions {
    email: string;
    subject: string;
    token: string;
    userId: string;
}

// ----------------------------EMAIL SENDING-----------------------------------
const sendEmailForResetPassword = async (options: ResetPasswordOptions, name: String) => {
    try {
        const emailUsername: string = process.env.EMAIL_USERNAME!;
        const emailPassword = process.env.EMAIL_PASSWORD!;
        const emailPort = process.env.EMAIL_PORT!;
        const emailHost = process.env.EMAIL_HOST!;

        const font = process.env.FRONTEND_BASE_URL!;


        const transporter = nodemailer.createTransport({
            host: emailHost,
            port: parseInt(emailPort),
            secure: false,
            auth: {
                user: emailUsername,
                pass: emailPassword,
            },
        });

        const htmlContent =

            `
<p>Poštovani <strong>${name}</strong>,</p>
<p>Primili smo zahtjev za resetovanje šifre za Vaš nalog.</p>
<p>Molimo vas da koristite sljedeći token za resetovanje šifre:</p>
<p><span style="font-size: 32px; background-color: #f0f0f0; padding: 5px 10px; border-radius: 4px;">${options.token}</span></p>
<p>Token ističe za  10 minuta.</p>
<p>Srdačan pozdrav,</p>
<p><strong>Esimaj Tim</strong></p>
`


        const mailOptions = {
            from: emailUsername,
            to: options.email,
            subject: options.subject,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error(error)
        return false;
    }

};
const sendEmailForVerification = async (options: VerifyEmailOptions, name: String) => {
    try {
        const emailUsername: string = process.env.EMAIL_USERNAME!;
        const emailPassword = process.env.EMAIL_PASSWORD!;
        const emailPort = process.env.EMAIL_PORT!;
        const emailHost = process.env.EMAIL_HOST!;

        const font = process.env.FRONTEND_BASE_URL!;


        const transporter = nodemailer.createTransport({
            host: emailHost,
            port: parseInt(emailPort),
            secure: false,
            auth: {
                user: emailUsername,
                pass: emailPassword,
            },
        });


        const verificationUrl = `${process.env.FRONTEND_BASE_URL}/verify-email?token=${options.token}&userId=${options.userId}`;

        const htmlContent =

            `
<p>Poštovani <strong>${name}</strong>,</p>
<p>Dobrobrodosli na ESimaj platformu!</p>
<p>Klikom na <a href="${verificationUrl}">here</a> verifikujte email.</p>
<p>Token ističe za  10 minuta.</p>
<p>Srdačan pozdrav,</p>
<p><strong>Esimaj Tim</strong></p>
`;


        const mailOptions = {
            from: emailUsername,
            to: options.email,
            subject: options.subject,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error(error)
        return false;
    }

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
const createEmailToken = function () {
    const emailToken = crypto.randomBytes(3).toString("hex");

    const hashEmailToken = crypto
        .createHash("sha256")
        .update(emailToken)
        .digest("hex");

    const now = new Date();
    const tokenExpires = new Date(now.getTime() + 10 * 60000);

    return { emailToken, hashEmailToken, tokenExpires };
};

export default {
    hashPassword,
    compare,
    createEmailToken,
    sendEmailForResetPassword,
    sendEmailForVerification
};
