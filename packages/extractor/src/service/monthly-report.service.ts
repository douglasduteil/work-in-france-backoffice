import { dossierRecordService } from "./dossier-record.service";

class MonthlyReportService {

    public buildMonthlyReport(year: number, month: number) {
        // fetch all dossiers for the month
        dossierRecordService.allByMonth(year, month)
        // compute monthly report by group

        // Collect id of without continuation dossier

        // save them

        // send them
    }

}

export const monthlyreportService = new MonthlyReportService();