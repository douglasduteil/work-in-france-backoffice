import * as cors from '@koa/cors';
import { addMonths, getMonth, getYear } from 'date-fns';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import { schedule } from 'node-cron';
import { flatMap, map, mergeMap } from 'rxjs/operators';
import { configuration } from './config';
import { router } from './routes';
import { dossierRecordService, monthlyreportService, sendMonthlyReportEmail, validityCheckService } from './service';
import { getMonthlyReportFilename } from './service/monthly-report/monthly-report.util';
import { logger } from './util';
import { YearMonth } from './util/interface/year-month';

const app = new Koa();

app.use(bodyParser());
app.use(cors());

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(configuration.apiPort);



if (configuration.validityCheckEnable) {
    schedule(configuration.validityCheckCron, () => {
        dossierRecordService.all().pipe(
            flatMap(x => x),
            map(validityCheckService.buildValidityChecks),
            mergeMap(validityCheckService.saveOrUpdate)
        ).subscribe({
            complete: () => logger.info(`[syncValidityChecks] completed`),
            next: next => logger.info(`[syncValidityChecks] validity check synchronised: ${next.ds_key}`)
        })
    });
}

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


const getPreviousMonthYear: () => YearMonth = () => {
    const date = addMonths(new Date(), -1);
    return {
        month: getMonth(date),
        year: getYear(date)
    }
}

