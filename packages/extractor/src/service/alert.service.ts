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
            this.addAlert(alerts, dossier, instructorIsNotDefined, 'Aucun instructeur définit, dossier accepté');
        } else if (isRefused(dossier)) {
            this.addAlert(alerts, dossier, isMessageSentAfterProcessedAt, 'Message envoyé après refus du dossier');
            this.addAlert(alerts, dossier, instructorIsNotDefined, 'Aucun instructeur définit, dossier refusé');
        } else if (isWithoutContinuation(dossier)) {
            this.addAlert(alerts, dossier, isMessageSentAfterProcessedAt, 'Message envoyé après le classement sans suite');
            this.addAlert(alerts, dossier, instructorIsNotDefined, 'Aucun instructeur définit, dossier sans suite');
        } else if (isReceived(dossier)) {
            this.addAlert(alerts, dossier, isReceivedTimeTooLong, 'Durée d\'instruction de dossier dépassée');
            this.addAlert(alerts, dossier, instructorIsNotDefined, 'Aucun instructeur définit, dossier en instruction');
        } else if (isInitiated(dossier)) {
            this.addAlert(alerts, dossier, isInitiatedTimeTooLong, 'Durée de construction de dossier dépassée');
        }

        const keys = dossier.ds_key.split('-');
        const procedureId = keys[0];
        const dossierId = keys[1];
        const alert: Alert = {
            ds_key: dossier.ds_key,
            url: `https://www.demarches-simplifiees.fr/procedures/${procedureId}/dossiers/${dossierId}`,
            // tslint:disable-next-line: object-literal-sort-keys
            group: dossier.metadata.group,
            messages: alerts,
            instructors_history: dossier.metadata.instructors_history
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

const lastMessageSentByStudentDate = (dossier: DossierRecord) => {
    const messages = allMessages(dossier);
    if (messages.length === 0) {
        return null;
    }
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.email.endsWith(configuration.direcctDomainName)) {
        return null;
    }
    return new Date(lastMessage.created_at);
}

const isMessageSentAfterProcessedAt = (dossier: DossierRecord) => {
    const lastSentDate = lastMessageSentByStudentDate(dossier);
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

const instructorIsNotDefined = (dossier: DossierRecord) => {
    const instructors = dossier.ds_data.instructeurs;
    if (!instructors) {
        return true;
    }
    if (instructors.length === 0) {
        return true;
    }
    return false;
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

