import { flatMap, map, mergeMap } from "rxjs/operators";
import { configuration } from "../config";
import { Alert } from "../model";
import { alertService, dossierRecordService } from "../service";
import { handleScheduler } from "./scheduler.service";

export const alertScheduler = {
    start: () => {
        handleScheduler(configuration.alertCron, 'alert', (start: number, end: number) => {
            return dossierRecordService.allByUpdatedAtBetween(start, end).pipe(
                flatMap(x => x),
                map(x => alertService.getAlerts(x)),
                flatMap(x => x),
                mergeMap((alert: Alert) => alertService.addIfNotExists(alert), undefined, 100),
            )
        });
    }
}