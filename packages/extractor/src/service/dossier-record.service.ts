import { Observable, of } from "rxjs";
import { flatMap } from "rxjs/operators";
import { DossierRecord } from "../model";
import { dossierRecordRepository } from "../repository";
import { logger } from "../util";

class DossierRecordService {

    public allByMonth(year: number, month: number): Observable<DossierRecord> {
        logger.info(`[DossierRecordService.allByMonth] ${year}-${month}`);
        return of();
    }

    public all(): Observable<DossierRecord> {
        return dossierRecordRepository.all().pipe(
            flatMap(x => x)
        );
    }
}

export const dossierRecordService = new DossierRecordService();