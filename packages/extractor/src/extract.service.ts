import { addMonths, getMonth, getYear, isBefore } from "date-fns";
import { Observable, Observer, Subject } from "rxjs";
import { concatMap, exhaustMap, filter, flatMap, map, mergeMap } from "rxjs/operators";
import { Alert } from "./model/alert.model";
import { MonthlyReport } from "./model/monthly-report.model";
import { dossierRecordService, validityCheckService } from "./service";
import { alertService } from "./service/alert.service";
import { monthlyreportService } from "./service/monthly-report.service";
import { logger } from "./util";

class ExtractorService {

    private syncAllMonthlyReports$ = new Subject();
    private syncAllAlerts$ = new Subject();

    constructor() {
        this.initAllMonthlyReportSynchro();
        this.initAllAlertsSynchro();
    }

    public syncValidityChecks() {
        dossierRecordService.all().pipe(
            flatMap(x => x),
            // tap((res) => logger.info(`[ExtractorService.syncValidityChecks] dossier ${res.ds_key}`)),
            map(validityCheckService.buildValidityChecks),
            // tap((res) => logger.info(`[ExtractorService.syncValidityChecks] validity check`, res)),
            mergeMap(validityCheckService.saveOrUpdate)
        ).subscribe({
            complete: () => logger.info(`[ExtractorService.syncValidityChecks] completed`),
            next: next => logger.info(`[ExtractorService.syncValidityChecks] check ${next.ds_key} synchronised`)
        })
    }

    public launchGlobalMonthlyReportSynchro() {
        this.syncAllMonthlyReports$.next();
    }

    public launchGlobalAlertSynchro() {
        this.syncAllAlerts$.next();
    }

    public syncMonthlyReportsForPreviousMonth() {
        const date = addMonths(new Date(), -1);
        const year = getYear(date);
        const month = getMonth(date);
        monthlyreportService.syncMonthlyReports(year, month).subscribe({
            complete: () => logger.info(`[ExtractorService.syncMonthlyReports] completed`),
            next: (next: MonthlyReport) => logger.info(`[ExtractorService.syncMonthlyReports] report ${next.year}-${next.month} ${next.group.label} synchronised `)
        })
    }

    private allMonthlyReports(): Observable<MonthlyReport> {
        return allDates$.pipe(
            concatMap((res: YearMonth) => monthlyreportService.syncMonthlyReports(res.year, res.month))
        );
    }

    private allAlerts(): Observable<Alert> {
        return dossierRecordService.all().pipe(
            flatMap(x => x),
            map(x => alertService.getAlert(x)),
            filter(x => x.messages.length > 0),
            mergeMap((alert: Alert) => alertService.saveOrUpdate(alert)),
        )
    }

    private initAllMonthlyReportSynchro() {
        this.syncAllMonthlyReports$.pipe(
            exhaustMap(_ => this.allMonthlyReports())
        ).subscribe({
            complete: () => logger.info(`[ExtractorService.syncMonthlyReports] completed`),
            next: (next: MonthlyReport) => logger.info(`[ExtractorService.syncMonthlyReports] report ${next.year}-${next.month} ${next.group.label} synchronised `)
        });
    }

    private initAllAlertsSynchro() {
        this.syncAllAlerts$.pipe(
            exhaustMap(_ => this.allAlerts())
        ).subscribe({
            complete: () => logger.info(`[ExtractorService.syncAlerts] completed`),
            next: (next: Alert) => logger.info(`[ExtractorService.syncAlerts] alert ${next.ds_key} created `)
        });
    }
}

interface YearMonth { year: number, month: number };

const allDates$ = Observable.create((observer: Observer<YearMonth>) => {
    let start = new Date(2018, 1, 1);
    const onMonthBefore = addMonths(new Date(), -1);
    while (isBefore(start, onMonthBefore)) {
        observer.next({ year: getYear(start), month: getMonth(start) });
        start = addMonths(start, 1);
    }
    observer.complete();
});

export const extractorService = new ExtractorService();