
import { Resend } from 'resend';




const sendEmailForContactForm = async (
    email: string,
    question: string,
    device: string | null,
    orderNumber: string | null
) => {
    try {
        const emailUsername: string = process.env.EMAIL_USERNAME!;
        const supportEmail: string = process.env.EMAIL_SUPPORT!;
        const resendApiKey = process.env.RESEND_API_KEY!;

        const htmlContent = `
            <h3>New Contact Form Message</h3>

            <p><strong>From:</strong> ${email}</p>

            ${device ? `<p><strong>Device:</strong> ${device}</p>` : ""}
            ${orderNumber ? `<p><strong>Order Number:</strong> ${orderNumber}</p>` : ""}

            <p><strong>Question / Message:</strong></p>
            <p>${question}</p>
        `;

        const resend = new Resend(resendApiKey);

        await resend.emails.send({
            from: emailUsername,
            to: supportEmail,
            subject: "Contact Form",
            html: htmlContent,
        });
        return true;
    } catch (error) {
        console.error("Error sending contact form email:", error);
    }
};



export default {
    sendEmailForContactForm,
};
