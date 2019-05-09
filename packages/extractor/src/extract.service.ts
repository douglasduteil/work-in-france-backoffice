import { map, mergeMap } from "rxjs/operators";
import { dossierRecordService, validityCheckService } from "./service";

class ExtractorService {

    public syncValidityChecks() {
        return dossierRecordService.all().pipe(
            // tap((res) => logger.info(`[ExtractorService.syncValidityChecks] dossier ${res.ds_key}`)),
            map(validityCheckService.buildValidityChecks),
            // tap((res) => logger.info(`[ExtractorService.syncValidityChecks] validity check`, res)),
            mergeMap(validityCheckService.saveOrUpdate)
        )
    }
}

export const extractorService = new ExtractorService();