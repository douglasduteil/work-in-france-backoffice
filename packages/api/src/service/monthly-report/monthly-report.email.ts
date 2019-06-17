import { createWriteStream } from "fs";
import { of } from "rxjs";
import { concatMap, map, mergeMap, tap } from "rxjs/operators";
import { fileSync } from "tmp";
import { configuration } from "../../config";
import { MonthlyReport } from "../../model/monthly-report.model";
import { sendEmail } from "../email";
import { writeMonthlyReport } from "./monthly-report.excel";
import { getMonthlyReportFilename } from "./monthly-report.util";

export const sendMonthlyReportEmail = (report: MonthlyReport) => {
  const tempFileName = fileSync();
  const writeStream = createWriteStream(tempFileName.name);
  return of({ report, tempFileName, writeStream }).pipe(
    mergeMap(
      (arg: any) => writeMonthlyReport(arg.report, arg.writeStream),
      (arg: any) => arg
    ),
    map((arg: any) => ({
      ...arg,
      email: buildMonthlyReportEmail(arg.report, arg.tempFileName.name)
    })),
    concatMap(
      (arg: any) => sendEmail(arg.email),
      (arg, emailResponse) => ({ ...arg, emailResponse })
    ),
    tap((res: any) => res.tempFileName.removeCallback())
  );
};

const buildMonthlyReportEmail = (report: MonthlyReport, path: string) => {
  const filename = getMonthlyReportFilename(
    report.year,
    report.month,
    report.group.id
  );

  return {
    to: [
      {
        email: configuration.monthlyReportEmailRecepient,
        name: configuration.monthlyReportEmailRecepient
      }
    ],
    // tslint:disable-next-line: object-literal-sort-keys
    bcc: [],
    cci: [],
    subject: `Work In France: rapport mensuel ${report.group.id}`,
    // tslint:disable-next-line: object-literal-sort-keys
    bodyText: `Bonjour,

        Veuillez trouver le rapport mensuel de Work In France en pièce jointe.

        L'équipe Work In France`,
    attachments: [
      {
        cid: filename,
        filename,
        path
      }
    ]
  };
};
