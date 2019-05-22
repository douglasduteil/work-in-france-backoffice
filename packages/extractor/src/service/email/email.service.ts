import { logger } from "../../util";


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
    logger.info(email);
}