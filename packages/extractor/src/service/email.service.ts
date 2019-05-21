import { connect } from "node-mailjet";
import { configuration } from "../config";

const mailjet = connect(configuration.mailJetAPIPublicKey, configuration.mailJetAPIPrivateKey);

const senderEmail = configuration.mailJetSenderEmail;
const senderEmailName = configuration.mailJetSenderEmailName;

export interface Email {
    recipient: {
        email: string,
        name: string
    },
    subject: string,
    bodyText: string,
    attachment: {
        ContentType: string
        Filename: string
        Base64Content: string
    }
}

export const sendEmail = (email: Email) => {
    return mailjet
        .post("send", { 'version': 'v3.1' })
        .request({
            Messages: [
                {
                    From: {
                        Email: senderEmail,
                        Name: senderEmailName
                    },
                    To: [
                        {
                            Email: email.recipient.email,
                            Name: email.recipient.name
                        }
                    ],
                    // tslint:disable-next-line: object-literal-sort-keys
                    Subject: email.subject,
                    TextPart: email.bodyText,
                    Attachments: [email.attachment],
                }
            ]
        })
}