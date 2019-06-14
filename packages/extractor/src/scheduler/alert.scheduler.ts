import { SentMessageInfo } from "nodemailer";
import { Observable, of } from "rxjs";
import { concatMap, flatMap, map, mergeMap } from "rxjs/operators";
import { configuration } from "../config";
import { Alert, DossierRecord } from "../model";
import {
  alertService,
  dossierRecordService,
  Email,
  sendEmail
} from "../service";
import { handleScheduler } from "./scheduler.service";

export const alertScheduler = {
  start: () => {
    handleScheduler(
      configuration.alertCron,
      "alert",
      (start: number, end: number) => {
        return addAlerts(start, end);
      }
    );

    handleScheduler(configuration.alertEmailCron, "alert-email", () => {
      return alertService.getAlertsToSend().pipe(
        flatMap((x: Alert[]) => x),
        concatMap((alert: Alert) => sendAlertByEmail(alert))
      );
    });
  }
};

function buildEmail(alert: Alert): Email {
  return {
    to: [{ email: "thomas.glatt@beta.gouv.fr", name: "Thomas" }],
    // tslint:disable-next-line: object-literal-sort-keys
    bcc: [],
    cci: [],
    subject: "Alert",
    bodyText: alert.message,
    attachments: []
  };
}

function addAlerts(start: number, end: number): Observable<Alert> {
  return dossierRecordService.allByUpdatedAtBetween(start, end).pipe(
    flatMap((x: DossierRecord[]) => x),
    map((x: DossierRecord) => alertService.getAlerts(x)),
    flatMap((x: Alert[]) => x),
    mergeMap(
      (alert: Alert) => alertService.addIfNotExists(alert),
      undefined,
      100
    )
  );
}

function sendAlertByEmail(alert: Alert) {
  return of(alert).pipe(
    mergeMap(
      (input: Alert) => sendEmail(buildEmail(input)),
      (input, emailResponse) => ({ alert: input, emailResponse })
    ),
    mergeMap((x: { alert: Alert; emailResponse: SentMessageInfo }) =>
      alertService.markAsSent(x.alert, x.emailResponse.messageId)
    )
  );
}
