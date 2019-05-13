import { Observable } from "rxjs";
import { configuration } from "../config";
import { DeletedData, kintoClient, KintoCollection } from "../lib";
import { MonthlyReport } from "../model/monthly-report.model";

class MonthlyReportRepository {

    private collection: KintoCollection<MonthlyReport>;

    constructor() {
        const kintoAPI = configuration.kintoAPI || '';
        const kintoLogin = configuration.kintoLogin || '';
        const kintoPassword = configuration.kintoPassword || '';
        this.collection = kintoClient(kintoAPI, kintoLogin, kintoPassword).collection<MonthlyReport>("monthly_reports")
    }

    public delete(year: number, month: number, groupId: string): Observable<DeletedData[]> {
        return this.collection.delete(`year=${year}&month=${month}&group.id="${groupId}"`);
    }

    public add(report: MonthlyReport): Observable<MonthlyReport> {
        return this.collection.add(report);
    }

}

export const monthlyReportRepository = new MonthlyReportRepository();