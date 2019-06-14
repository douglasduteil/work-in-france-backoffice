import { createTransport, SentMessageInfo } from "nodemailer";
import { from, Observable } from "rxjs";
import { configuration } from "../../config";
import { logger } from "../../util";

export interface Attachment {
  cid: string;
  filename: string;
  path: string;
}

export interface EmailAddress {
  email: string;
  name: string;
}

export interface Email {
  to: EmailAddress[];
  bcc: EmailAddress[];
  cci: EmailAddress[];
  subject: string;
  bodyText: string;
  attachments: Attachment[];
}

const transporter = createTransport({
  host: configuration.mailHost,
  port: configuration.mailPort,
  secure: configuration.mailUseTLS, // true for 465, false for other ports
  // tslint:disable-next-line: object-literal-sort-keys
  auth: {
    user: configuration.mailUsername,
    // tslint:disable-next-line: object-literal-sort-keys
    pass: configuration.mailPassword
  }
});

// https://github.com/nodemailer/nodemailer/blob/master/examples/sendmail.js
export const sendEmail: (email: Email) => Observable<SentMessageInfo> = (
  email: Email
) => {
  logger.info(`[EmailService.sendEmail] subject ${email.subject}`);
  const message = {
    from: configuration.mailFrom,
    to: email.to.map((r: EmailAddress) => `${r.name} <${r.email}>`).join(","),
    // tslint:disable-next-line: object-literal-sort-keys
    bcc: email.bcc.map((r: EmailAddress) => `${r.name} <${r.email}>`).join(","),
    subject: email.subject,
    text: email.bodyText,

    // An array of attachments
    attachments: email.attachments.map((a: Attachment) => ({
      cid: a.path, // should be as unique as possible
      filename: a.filename,
      path: a.path
    }))
  };

  return from(transporter.sendMail(message));
};
