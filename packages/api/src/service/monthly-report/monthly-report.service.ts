import { Observable } from "rxjs";
import { concatMap, flatMap, mergeMap } from "rxjs/operators";
import { Stream } from "stream";
import {
  DossierRecord,
  DSGroup,
  getDemarcheSimplifieeUrl,
  getNationality,
  isClosed,
  isLong,
  isRefused,
  isWithoutContinuation,
  ProcedureConfig
} from "../../model";
import { initReport, MonthlyReport } from "../../model/monthly-report.model";
import { monthlyReportRepository } from "../../repository";
import { logger } from "../../util";
import { procedureConfigService } from "../dossier-record";
import { dossierRecordService } from "../dossier-record/dossier-record.service";
import { writeMonthlyReport } from "./monthly-report.excel";

interface GroupReport {
  group: DSGroup;
  year: number;
  month: number;
  dossiers: DossierRecord[];
}

class MonthlyReportService {
  public async writeMonthlyReportExcel(
    year: number,
    month: number,
    groupId: string,
    stream: Stream
  ) {
    const reports: MonthlyReport[] = await monthlyReportRepository
      .find(year, month, groupId)
      .toPromise();
    logger.info(
      `[MonthlyReportService.writeMonthlyReport] ${
        reports.length
      } reports found for year: ${year}, month: ${month}, group: ${groupId}`
    );
    if (reports.length === 0) {
      return;
    }
    await writeMonthlyReport(reports[0], stream);
  }

  public findByYearAndMonth(
    year: number,
    month: number
  ): Observable<MonthlyReport[]> {
    return monthlyReportRepository.find(year, month);
  }

  public syncMonthlyReports(
    year: number,
    month: number
  ): Observable<MonthlyReport> {
    return this.getReportGroups(year, month).pipe(
      mergeMap((groupReport: GroupReport) => {
        const report = buildReport(groupReport);
        return monthlyreportService.saveOrUpdate(report);
      })
    );
  }

  private saveOrUpdate(report: MonthlyReport): Observable<MonthlyReport> {
    return monthlyReportRepository
      .delete(report.year, report.month, report.group.id)
      .pipe(mergeMap(() => monthlyReportRepository.add(report)));
  }

  private getReportGroups(
    year: number,
    month: number
  ): Observable<GroupReport> {
    return procedureConfigService.all().pipe(
      flatMap((x: ProcedureConfig[]) => x),
      concatMap(
        (x: ProcedureConfig) =>
          dossierRecordService.allByMonthAndGroupId(year, month, x.group.id),
        (config, dossiers) => ({ group: config.group, year, month, dossiers })
      )
    );
  }
}

export const monthlyreportService = new MonthlyReportService();

const buildReport: (groupReport: GroupReport) => MonthlyReport = (
  groupReport: GroupReport
) => {
  const dossiers = groupReport.dossiers;
  const report = initReport(
    groupReport.year,
    groupReport.month,
    groupReport.group
  );
  return dossiers.reduce((acc, dossier) => {
    try {
      return incrementReport(acc, dossier);
    } catch (err) {
      logger.error(
        `[MonthlyReportService.buildReport] error with dossier ${
          dossier.ds_key
        }`,
        err
      );
      return acc;
    }
  }, report);
};

const determineCounter = (dossier: DossierRecord, report: MonthlyReport) => {
  if (isClosed(dossier)) {
    return isLong(dossier)
      ? report.accepted.more3Months
      : report.accepted.less3Months;
  } else if (isRefused(dossier)) {
    return report.refused;
  } else if (isWithoutContinuation(dossier)) {
    return report.withoutContinuation;
  }
  throw new Error(
    `[MonthlyReportService.determineCounter] no counter found for dossier ${
      dossier.ds_key
    } ${dossier.metadata.state}`
  );
};

const incrementReport = (report: MonthlyReport, dossier: DossierRecord) => {
  const counter = determineCounter(dossier, report);
  const nationality = getNationality(dossier);
  counter.count++;
  if (!counter.countries[nationality]) {
    counter.countries[nationality] = 0;
  }
  counter.dossiers.push(getDemarcheSimplifieeUrl(dossier));
  counter.countries[nationality]++;
  return report;
};
