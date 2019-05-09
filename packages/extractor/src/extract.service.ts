import { map, mergeMap } from "rxjs/operators";
import { dossierRecordService, validityCheckService } from "./service";
import { logger } from "./util";

class ExtractorService {

    public syncValidityChecks() {
        dossierRecordService.all().pipe(
            // tap((res) => logger.info(`[ExtractorService.syncValidityChecks] dossier ${res.ds_key}`)),
            map(validityCheckService.buildValidityChecks),
            // tap((res) => logger.info(`[ExtractorService.syncValidityChecks] validity check`, res)),
            mergeMap(validityCheckService.saveOrUpdate)
        ).subscribe({
            complete: () => logger.info(`[ExtractorService.syncValidityChecks] completed`),
            next: next => logger.info(`[ExtractorService.syncValidityChecks] check ${next.ds_key} synchronised`)
        })
    }
}

export const extractorService = new ExtractorService();