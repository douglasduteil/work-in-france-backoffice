import { addMonths, getMonth, getYear, isBefore } from "date-fns";
import { Observable, Observer, Subject } from "rxjs";
import { concatMap, exhaustMap } from "rxjs/operators";
import { MonthlyReport } from "./model/monthly-report.model";
import { monthlyreportService } from "./service";
import { logger } from "./util";
import { YearMonth } from "./util/interface/year-month";

class ExtractorService {
  private syncAllMonthlyReports$ = new Subject();

  constructor() {
    this.initAllMonthlyReportSynchro();
  }

  public launchGlobalMonthlyReportSynchro() {
    this.syncAllMonthlyReports$.next();
  }

  private allMonthlyReports(): Observable<MonthlyReport> {
    return allDates$.pipe(
      concatMap((res: YearMonth) =>
        monthlyreportService.syncMonthlyReports(res.year, res.month)
      )
    );
  }

  private initAllMonthlyReportSynchro() {
    this.syncAllMonthlyReports$
      .pipe(exhaustMap(() => this.allMonthlyReports()))
      .subscribe({
        complete: () => logger.info(`[monthly reports synchro] completed`),
        error: (err: any) =>
          logger.error(`[monthly reports synchro] error: `, err),
        next: (next: MonthlyReport) =>
          logger.info(
            `[monthly reports synchro] report ${next.year}-${next.month} ${
              next.group.label
            } synchronised `
          )
      });
  }
}

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
