import { configuration } from "../../config";
import { MonthlyReport } from "../../model/monthly-report.model";
import { mimeTypes } from "../../util";
import { sendEmail } from "../email/email.service";
import { getMonthlyReportFilename } from "./monthly-report.util";

export const sendMonthlyReportEmail = (report: MonthlyReport) => {
    return sendEmail(buildMonthlyReportEmail(report));
}

const buildMonthlyReportEmail = (report: MonthlyReport) => {
    return {
        recipient: {
            email: configuration.monthlyReportEmailRecepient,
            name: configuration.monthlyReportEmailRecepient
        },
        subject: `Work In France: rapport mensuel ${report.group.id}`,
        // tslint:disable-next-line: object-literal-sort-keys
        bodyText: `Bonjour,
        
        Veuillez trouver le rapport mensuel de Work In France en pièce jointe.
        
        L'équipe Work In France`,
        attachment: {
            Base64Content: '',
            ContentType: mimeTypes.excel,
            Filename: getMonthlyReportFilename(report.year, report.month, report.group.id),
        }
    }
}