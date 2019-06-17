import { addMonths, getMonth, getYear } from "date-fns";
import { SentMessageInfo } from "nodemailer";
import { concatMap, tap } from "rxjs/operators";
import { configuration } from "../config";
import { MonthlyReport } from "../model/monthly-report.model";
import { monthlyreportService, sendMonthlyReportEmail } from "../service";
import { logger, YearMonth } from "../util";
import { handleScheduler } from "./scheduler.service";

export const monthlyReportScheduler = {
  start: () => {
    handleScheduler(configuration.monthlyReportCron, "monthly-report", () => {
      const { month, year } = getPreviousMonthYear();
      return monthlyreportService.syncMonthlyReports(year, month).pipe(
        concatMap((report: MonthlyReport) => sendMonthlyReportEmail(report)),
        tap((res: { report: MonthlyReport; emailResponse: SentMessageInfo }) =>
          logger.info(
            `[Monthly Report Email] success: ${res.report.group.id} - ${
              res.emailResponse.messageId
            }`
          )
        )
      );
    });
  }
};

const getPreviousMonthYear: () => YearMonth = () => {
  const date = addMonths(new Date(), -1);
  return {
    month: getMonth(date),
    year: getYear(date)
  };
};
