import { Observable } from "rxjs";
import { flatMap } from "rxjs/operators";
import { DossierRecord } from "../model";
import { dossierRecordRepository } from "../repository";

class DossierRecordService {

    public all(): Observable<DossierRecord> {
        return dossierRecordRepository.all().pipe(
            flatMap(x => x)
        );
    }
}

export const dossierRecordService = new DossierRecordService();