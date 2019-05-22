import { schedule } from "node-cron";
import { concatMap, filter, flatMap, reduce, tap } from "rxjs/operators";
import { configuration } from "../config";
import { ValidityCheck } from "../model";
import { dossierRecordService, validityCheckService } from "../service";
import { logger } from "../util";

export const validityCheckScheduler = {
    start: () => {
        if (configuration.validityCheckEnable) {
            schedule(configuration.validityCheckCron, () => {
                logger.info(`[syncValidityChecks] start validity checks synchro`)

                dossierRecordService.allByState('closed').pipe(
                    tap((res) => logger.info(`[syncValidityChecks] ${res.length} dossiers fetched`)),
                    flatMap(x => x),
                    filter(validityCheckService.isValid),
                    concatMap(validityCheckService.addIfNotExists),
                    tap((res) => logger.info(`[syncValidityChecks] validity check created ${res.ds_key} `)),
                    reduce((acc: ValidityCheck[], current: ValidityCheck) => {
                        acc.push(current);
                        return acc;
                    }, []),
                ).subscribe({
                    complete: () => logger.info(`[syncValidityChecks] completed`),
                    error: (err) => logger.error(`[syncValidityChecks] error `, err),
                    next: next => logger.info(`[syncValidityChecks] ${next.length} validity check created`)
                })
            });
        }
    }
}