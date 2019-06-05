import { Observable, of } from "rxjs";
import { concatMap, flatMap, map, mergeMap } from "rxjs/operators";
import { configuration } from "../config";
import { Alert } from "../model";
import { alertService, dossierRecordService, Email, sendEmail } from "../service";
import { handleScheduler } from "./scheduler.service";

export const alertScheduler = {
    start: () => {
        handleScheduler(configuration.alertCron, 'alert', (start: number, end: number) => {
            return addAlerts(start, end).pipe(
                concatMap(alert => sendAlertByEmail(alert))
            );
        });
    }
}

function buildEmail(alert: Alert): Email {
    return {
        to: [{ email: 'thomas.glatt@beta.gouv.fr', name: 'Thomas' }],
        // tslint:disable-next-line: object-literal-sort-keys
        bcc: [],
        cci: [],
        subject: 'Alert',
        bodyText: alert.message,
        attachments: []
    }
}

function addAlerts(start: number, end: number): Observable<Alert> {
    return dossierRecordService.allByUpdatedAtBetween(start, end).pipe(
        flatMap(x => x),
        map(x => alertService.getAlerts(x)),
        flatMap(x => x),
        mergeMap((alert: Alert) => alertService.addIfNotExists(alert), undefined, 100),
    )
}

function sendAlertByEmail(alert: Alert) {
    return of(alert).pipe(
        mergeMap(input => sendEmail(buildEmail(input))
            , (input, emailResponse) => ({ alert: input, emailResponse })),
        mergeMap(x => alertService.markAsSent(x.alert, x.emailResponse.messageId))
    )
}