import argon2 from "argon2";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { Resend } from 'resend';
import QRCode from "qrcode";
import path from "path";
import fs from "fs";





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
        const resendApiKey = process.env.RESEND_API_KEY!;
        const emailUsername: string = process.env.EMAIL_USERNAME!;

        const logoPath = path.join(process.cwd(), "assets/esimaj_logo.png");
        const logoBuffer = fs.readFileSync(logoPath);





        const resend = new Resend(resendApiKey);

        const htmlContent =
            `
                  <img src="cid:logoId" style="max-width: 160px; width: 100%; height: auto;" />
                    <p>Poštovani <strong>${name}</strong>,</p>
                    <p>Primili smo zahtjev za resetovanje šifre za Vaš nalog.</p>
                    <p>Molimo vas da koristite sljedeći token za resetovanje šifre:</p>
                    <p><span style="font-size: 32px; background-color: #f0f0f0; padding: 5px 10px; border-radius: 4px;">${options.token}</span></p>
                    <p>Token ističe za  10 minuta.</p>
                    <p>Srdačan pozdrav,</p>
                    <p><strong>Esimaj Tim</strong></p>
        `
        await resend.emails.send({
            from: emailUsername,
            to: options.email,
            subject: options.subject,
            html: htmlContent,
            attachments: [
                {
                    filename: "logo.png",
                    content: logoBuffer,
                    contentId: "logoId",

                },
            ],
        });
        return true;
    } catch (error) {
        console.error(error)
        return false;
    }

};
const sendQRcode = async (subject: string, to: string, lpaString: string, apn: string, amount: number, days: number, customerName: string, countryName: string, orderId: number, networks: string, provider: string) => {


    var htmlContent = fs.readFileSync(path.resolve("templates/esim_activation_sr.html"), "utf-8");

    // 1. Generate QR Code (PNG Base64)
    const qrBase64 = await QRCode.toDataURL(lpaString);
    const qrImageBuffer = Buffer.from(qrBase64.split(",")[1], "base64");



    const emailUsername: string = process.env.EMAIL_USERNAME!;
    const resendApiKey = process.env.RESEND_API_KEY!;

    // const htmlContent =
    //     `
    //         <h2>Your eSIM QR</h2>
    //         <p>Scan the QR code below:</p>
    //         <img src="cid:qrcode" />
    //     `;

    const resend = new Resend(resendApiKey);

    const { activationCode, smdp } = extractIOSCodes(lpaString);

    htmlContent = htmlContent
        .replace(/{{provider}}/g, provider)
        .replace(/{{customerName}}/g, customerName)
        .replace(/{{country}}/g, countryName)
        .replace(/{{orderId}}/g, orderId.toString())
        .replace(/{{activationCode}}/g, activationCode)
        .replace(/{{smdp}}/g, smdp)
        .replace(/{{networks}}/g, networks)
        .replace(/{{apn}}/g, apn)
        .replace(/{{dataAmount}}/g, amount.toString())
        .replace(/{{validity}}/g, days.toString())
        .replace(/{{{{lpaString}}}}/g, lpaString)
        .replace(/{{iosUrl}}/g, `#${process.env.FRONTEND_BASE_URL_PRODUCTION!}/instructions/ios`)
        .replace(/{{androidUrl}}/g, `#${process.env.FRONTEND_BASE_URL_PRODUCTION!}/instructions/android`)
        .replace(/{{samsungUrl}}/g, `#${process.env.FRONTEND_BASE_URL_PRODUCTION!}/instructions/samsung`)



    await resend.emails.send({
        from: emailUsername,
        to: to,
        subject: subject,
        html: htmlContent,
        attachments: [
            {
                filename: "qr.png",
                content: qrImageBuffer,
                contentId: "qrcode",

            },
        ],
    });

}

function extractIOSCodes(lpa: string) {
    const parts = lpa.split("$");

    if (parts.length < 3) {
        throw new Error("Invalid LPA format");
    }

    return {
        smdp: parts[1],
        activationCode: parts[2]
    };
}

const sendEmailForVerification = async (options: VerifyEmailOptions, name: String) => {
    try {



        const emailUsername: string = process.env.EMAIL_USERNAME!;
        const resendApiKey = process.env.RESEND_API_KEY!;

        const font = process.env.FRONTEND_BASE_URL!;

        const verificationUrl = `${process.env.FRONTEND_BASE_URL}/verify-email?token=${options.token}&userId=${options.userId}`;

        const htmlContent =

            `
<p>Poštovani <strong>${name}</strong>,</p>
<p>Dobrobrodosli na ESimaj platformu!</p>
<p>Klikom na <a href="${verificationUrl}">here</a> verifikujte email.</p>
<p>Token ističe za  120 minuta.</p>
<p>Srdačan pozdrav,</p>
<p><strong>Esimaj Tim</strong></p>
`;




        const resend = new Resend(resendApiKey);

        await resend.emails.send({
            from: emailUsername,
            to: options.email,
            subject: options.subject,
            html: htmlContent
        });


        // const transporter = nodemailer.createTransport({
        //     host: emailHost,
        //     port: parseInt(emailPort),
        //     secure: false,
        //     auth: {
        //         user: emailUsername,
        //         pass: emailPassword,
        //     },
        //     tls: {
        //         rejectUnauthorized: false,
        //     }
        // });




        // const mailOptions = {
        //     from: emailUsername,
        //     to: options.email,
        //     subject: options.subject,
        //     html: htmlContent,
        // };

        // await transporter.sendMail(mailOptions);
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
    // token aktivan 2 sata
    const tokenExpires = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    return { emailToken, hashEmailToken, tokenExpires };
};

export default {
    hashPassword,
    compare,
    createEmailToken,
    sendEmailForResetPassword,
    sendEmailForVerification,
    sendQRcode
};
