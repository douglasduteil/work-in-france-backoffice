import { Observable } from "rxjs";
import { DeletedData } from "../lib";
import { MonthlyReport } from "../model/monthly-report.model";
import { KintoRepository } from "./kinto.repository";

class MonthlyReportRepository extends KintoRepository<MonthlyReport> {

    constructor() {
        super("monthly_reports");
    }

    public delete(year: number, month: number, groupId: string): Observable<DeletedData[]> {
        return this.collection.delete(`year=${year}&month=${month}&group.id="${groupId}"`);
    }

    public add(report: MonthlyReport): Observable<MonthlyReport> {
        return this.collection.add(report);
    }

    public all(): Observable<MonthlyReport[]> {
        return this.collection.all();
    }

}

export const monthlyReportRepository = new MonthlyReportRepository();