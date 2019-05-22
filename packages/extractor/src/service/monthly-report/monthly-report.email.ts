import { configuration } from "../../config";
import { MonthlyReport } from "../../model/monthly-report.model";
import { sendEmail } from "../email";

export const sendMonthlyReportEmail = (report: MonthlyReport) => {
    return sendEmail(buildMonthlyReportEmail(report));
}


const buildMonthlyReportEmail = (report: MonthlyReport) => {
    return {
        to: [{
            email: configuration.monthlyReportEmailRecepient,
            name: configuration.monthlyReportEmailRecepient
        }],
        // tslint:disable-next-line: object-literal-sort-keys
        bcc: [],
        cci: [],
        subject: `Work In France: rapport mensuel ${report.group.id}`,
        // tslint:disable-next-line: object-literal-sort-keys
        bodyText: `Bonjour,
        
        Veuillez trouver le rapport mensuel de Work In France en pièce jointe.
        
        L'équipe Work In France`,
        attachments: []
        // attachments: [{
        //     cid: '',
        //     filename: getMonthlyReportFilename(report.year, report.month, report.group.id),
        //     path: mimeTypes.excel
        // }]
    }
}