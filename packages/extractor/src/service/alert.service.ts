import { differenceInDays, differenceInMonths } from "date-fns";
import { Observable } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { configuration } from "../config";
import { DossierRecord, DSCommentaire, getDateDebutAPT, getDateDebutConstruction, getDateDebutInstruction, getDateFinAPT, isClosed, isInitiated, isReceived, isRefused, isWithoutContinuation } from "../model";
import { Alert } from "../model/alert.model";
import { alertRepository } from "../repository/alert.repository";

const dsContactEmail = configuration.alertDemarcheSimplifieeEmail;
const maxReceivedTimeInDays = configuration.alertMaxReceivedTimeInDays;
const maxInitiatedTimeInDays = configuration.alertMaxInitiatedTimeInDays;

class AlertService {

    public saveOrUpdate(alert: Alert): Observable<Alert> {
        return alertRepository.deleteByDSKey(alert.ds_key).pipe(
            mergeMap(() => alertRepository.add(alert))
        )
    }

    public getAlert(dossier: DossierRecord): Alert {

        const alerts: string[] = [];
        if (isClosed(dossier)) {
            this.addAlert(alerts, dossier, isDateDebutAPTNotPresent, 'Date de début APT manquante');
            this.addAlert(alerts, dossier, isDateFinAPTNotPresent, 'Date de fin APT manquante');
            this.addAlert(alerts, dossier, isFinAPTBeforeDebutAPT, 'Date de fin APT antérieure à Date de début APT');
            this.addAlert(alerts, dossier, isAPTSup12Months, 'Durée APT supérieure à 12 mois');
            this.addAlert(alerts, dossier, isMessageSentAfterProcessedAt, 'Message envoyé après acceptation du dossier');
        } else if (isRefused(dossier)) {
            this.addAlert(alerts, dossier, isMessageSentAfterProcessedAt, 'Message envoyé après refus du dossier');
        } else if (isWithoutContinuation(dossier)) {
            this.addAlert(alerts, dossier, isMessageSentAfterProcessedAt, 'Message envoyé après le classement sans suite');
        } else if (isReceived(dossier)) {
            this.addAlert(alerts, dossier, isReceivedTimeTooLong, 'Durée d\'instruction de dossier dépassée');
        } else if (isInitiated(dossier)) {
            this.addAlert(alerts, dossier, isInitiatedTimeTooLong, 'Durée de construction de dossier dépassée');
        }
        const alert: Alert = {
            ds_key: dossier.ds_key,
            group: dossier.metadata.group,
            messages: alerts,
        }
        return alert;
    }

    private addAlert(alerts: string[], dossier: DossierRecord, isAlert: (dossier: DossierRecord) => boolean, message: string) {
        if (isAlert(dossier)) {
            alerts.push(message);
        }
    }
}

export const alertService = new AlertService();

const allComments: (dossier: DossierRecord) => DSCommentaire[] = (dossier) => {
    return dossier.ds_data.commentaires ? dossier.ds_data.commentaires : [];
}

const allMessages: (dossier: DossierRecord) => DSCommentaire[] = (dossier) => {
    return allComments(dossier).filter((comment) => comment.email !== dsContactEmail);
}

const lastMessageDate = (dossier: DossierRecord) => {
    const messages = allMessages(dossier);
    if (messages.length === 0) {
        return null;
    }
    return new Date(messages[messages.length - 1].created_at);
}

const isMessageSentAfterProcessedAt = (dossier: DossierRecord) => {
    const lastSentDate = lastMessageDate(dossier);
    const processedAtTime = dossier.metadata.processed_at;
    if (!lastSentDate || !processedAtTime) {
        return false;
    }
    return lastSentDate.getTime() > processedAtTime;
}

const isReceivedTimeTooLong = (dossier: DossierRecord) => {
    const receivedDate = getDateDebutInstruction(dossier);
    return delayTooLong(receivedDate, maxReceivedTimeInDays);
}
const isInitiatedTimeTooLong = (dossier: DossierRecord) => {
    const initiatedDate = getDateDebutConstruction(dossier);
    return delayTooLong(initiatedDate, maxInitiatedTimeInDays);
}

const delayTooLong = (date: Date | null, maxDelay: number) => {
    if (!date) {
        return false;
    }
    const now = new Date();
    return differenceInDays(date, now) > maxDelay;
}

const isDateDebutAPTNotPresent = (dossier: DossierRecord) => {
    return getDateDebutAPT(dossier) == null;
}

const isDateFinAPTNotPresent = (dossier: DossierRecord) => {
    return getDateFinAPT(dossier) == null;
}

const isFinAPTBeforeDebutAPT = (dossier: DossierRecord) => {
    const fin = getDateDebutAPT(dossier);
    const debut = getDateFinAPT(dossier);
    if (!fin || !debut) {
        return false;
    }
    return fin.getTime() < debut.getTime();
}

const isAPTSup12Months = (dossier: DossierRecord) => {
    const fin = getDateDebutAPT(dossier);
    const debut = getDateFinAPT(dossier);
    if (!fin || !debut) {
        return false;
    }
    return differenceInMonths(debut, fin) > 12;
}

