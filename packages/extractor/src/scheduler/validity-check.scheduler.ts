import { filter, flatMap, mergeMap, tap } from "rxjs/operators";
import { configuration } from "../config";
import { dossierRecordService, validityCheckService } from "../service";
import { logger } from "../util";
import { handleScheduler } from "./scheduler.service";

export const validityCheckScheduler = {
    start: () => {
        if (!configuration.validityCheckEnable) {
            return;
        }
        handleScheduler(configuration.validityCheckCron, 'validity-check', (start: number, end: number) => {
            return dossierRecordService.allByStateAndProcessedAtBetween('closed', start, end).pipe(
                tap((res) => logger.info(`[syncValidityChecks] ${res.length} dossiers fetched`)),
                flatMap(x => x),
                filter(validityCheckService.isValid),
                mergeMap(validityCheckService.addIfNotExists, undefined, 100),
                tap((res) => logger.info(`[syncValidityChecks] validity check created ${res.ds_key} `))
            )
        })
    }
}