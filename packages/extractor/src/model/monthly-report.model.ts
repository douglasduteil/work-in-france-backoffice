import { IIdentifiable } from "../util";
import { DSGroup } from "./dossier-record.model";

export interface MonthlyReportCounter {
  count: number;
  countries: {
    [country: string]: number;
  };
  dossiers: string[];
}

export interface MonthlyReport extends IIdentifiable {
  year: number;
  month: number;
  group: DSGroup;
  accepted: {
    more3Months: MonthlyReportCounter;
    less3Months: MonthlyReportCounter;
  };
  refused: MonthlyReportCounter;
  withoutContinuation: MonthlyReportCounter;
}

const initMonthlyReportCounter: () => MonthlyReportCounter = () => ({
  count: 0,
  countries: {},
  dossiers: []
});

export const initReport: (
  year: number,
  month: number,
  group: DSGroup
) => MonthlyReport = (
  year: number,
  month: number,
  group: { id: string; label: string }
) => {
  return {
    year,
    // tslint:disable-next-line: object-literal-sort-keys
    month,
    group,
    accepted: {
      less3Months: initMonthlyReportCounter(),
      more3Months: initMonthlyReportCounter()
    },
    refused: initMonthlyReportCounter(),
    withoutContinuation: initMonthlyReportCounter()
  };
};
