import { IIdentifiable } from "../util";

export interface MonthlyReportCounter {
    count: number;
    countries: [
        {
            count: number;
            country: string;
        }
    ]
}

export interface MonthlyReport extends IIdentifiable {
    year: string;
    month: string;
    group: {
        id: string;
        label: string;
    },
    accepted: {
        more3Months: MonthlyReportCounter,
        less3Months: MonthlyReportCounter
    },
    refused: MonthlyReportCounter,
    withoutContinuation: MonthlyReportCounter;
}
