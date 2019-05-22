import * as cors from '@koa/cors';
import { addMonths, getMonth, getYear } from 'date-fns';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import { schedule } from 'node-cron';
import { concatMap, filter, flatMap, mergeMap, reduce, tap } from 'rxjs/operators';
import { configuration } from './config';
import { ValidityCheck } from './model';
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
        logger.info(`[syncValidityChecks] start validity checks synchro`)
        dossierRecordService.allByState('closed').pipe(
            tap((res) => logger.info(`[syncValidityChecks] ${res.length} dossiers fetched`)),
            flatMap(x => x),
            filter(validityCheckService.isValid),
            concatMap(validityCheckService.addIfNotExists),
            tap((res) => logger.info(`[syncValidityChecks] validity check created ${res.ds_key} `)),
            reduce((acc: ValidityCheck[], current: ValidityCheck) => {
                acc.push(current);
                return acc;
            }, []),
        ).subscribe({
            complete: () => logger.info(`[syncValidityChecks] completed`),
            error: (err) => logger.error(`[syncValidityChecks] error `, err),
            next: next => logger.info(`[syncValidityChecks] ${next.length} validity check created`)
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

