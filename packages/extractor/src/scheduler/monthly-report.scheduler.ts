import { addMonths, getMonth, getYear } from "date-fns";
import { schedule } from "node-cron";
import { flatMap, mergeMap } from "rxjs/operators";
import { configuration } from "../config";
import { monthlyreportService, sendMonthlyReportEmail } from "../service";
import { getMonthlyReportFilename } from "../service/monthly-report/monthly-report.util";
import { logger, YearMonth } from "../util";

export const monthlyReportScheduler = {
    start: () => {
        schedule(configuration.monthlyReportCron, () => {
            const { month, year } = getPreviousMonthYear();
            monthlyreportService.syncMonthlyReports(year, month).subscribe({
                complete: () => logger.info(`[syncMonthlyReports] completed`),
                next: (next) => logger.info(`[syncMonthlyReports] report synchronised: ${next.year}-${next.month} ${next.group.label}`)
            })
        });

        schedule(configuration.monthlyReportEmailCron, () => {
            const { month, year } = getPreviousMonthYear();
            monthlyreportService.findByYearAndMonth(year, month).pipe(
                flatMap(x => x),
                mergeMap(
                    (report) => sendMonthlyReportEmail(report),
                    (report, emailResponse) => ({ report, emailResponse }))
            ).subscribe({
                complete: () => logger.info(`[ExtractorService.sendMonthlyReports] completed`),
                next: (next) => logger.info(`[ExtractorService.sendMonthlyReports] report sent: ${getMonthlyReportFilename(year, month, next.report.group.id)}`)
            })
        });
    }
}

const getPreviousMonthYear: () => YearMonth = () => {
    const date = addMonths(new Date(), -1);
    return {
        month: getMonth(date),
        year: getYear(date)
    }
}