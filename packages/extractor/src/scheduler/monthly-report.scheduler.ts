import { addMonths, getMonth, getYear } from "date-fns";
import { concatMap, tap } from "rxjs/operators";
import { configuration } from "../config";
import { monthlyreportService, sendMonthlyReportEmail } from "../service";
import { logger, YearMonth } from "../util";
import { handleScheduler } from "./scheduler.service";


export const monthlyReportScheduler = {
    start: () => {
        handleScheduler(configuration.monthlyReportCron, 'monthly-report', () => {
            const { month, year } = getPreviousMonthYear();
            return monthlyreportService.syncMonthlyReports(year, month).pipe(
                concatMap((report) => sendMonthlyReportEmail(report)),
                tap(res => logger.info(`[Monthly Report Email] success: ${res.report.group.id} - ${res.emailResponse.id}`))
            );
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