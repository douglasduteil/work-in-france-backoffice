import { differenceInDays } from "date-fns";
import { asDate, IIdentifiable } from "../util";

export interface DSGroup {
    id: string,
    label: string
}

export interface DSChamp {
    value: string;
    type_de_champ: {
        libelle: string;
    }
}

export interface DSCommentaire {
    body: string;
    email: string;
    attachement: string | null;
    created_at: string;
}

interface DSEtablissement {
    siret: string;
}

export interface DSDossier {
    id: number;
    etablissement: DSEtablissement;
    champs: DSChamp[];
    champs_private: DSChamp[];
    commentaires: DSCommentaire[];

}

export interface DossierRecord extends IIdentifiable {
    ds_key: string;
    ds_data: DSDossier;
    metadata: {
        state: string;
        procedure_id: string;
        group: DSGroup;
        // date de création du dossier
        created_at: number;
        // date de depot du dossier
        initiated_at: number | null;
        // date de la dernière modification du dossier
        updated_at: number | null;
        // date du passage en instruction
        received_at: number | null;
        // date de décision du dossier
        processed_at: number | null;
    }
}

const getFieldValue = (champs: DSChamp[], libelle: string) => {
    const field = champs.find(f => f.type_de_champ.libelle === libelle);
    if (!field) {
        throw new Error(`field ${libelle} does not exists`);
    }
    return field.value;
};

const getPublicFieldValue = (dossier: DSDossier, libelle: string) => getFieldValue(dossier.champs, libelle);
const getPrivateFieldValue = (dossier: DSDossier, libelle: string) => getFieldValue(dossier.champs_private, libelle);

export const hasExpired = (dossier: DossierRecord): boolean => {
    const endDate = getDateFinAPT(dossier);
    if (!endDate) {
        return true;
    }
    if (endDate < new Date()) {
        return true;
    }
    return false;
};

export const getDateDebutAPTValue = (doc: DossierRecord) => getPrivateFieldValue(doc.ds_data, "Date de début APT");
export const getDateFinAPTValue = (doc: DossierRecord) => getPrivateFieldValue(doc.ds_data, "Date de fin APT");
export const getPrenomValue = (doc: DossierRecord) => getPublicFieldValue(doc.ds_data, "Prénom");
export const getNomValue = (doc: DossierRecord) => getPublicFieldValue(doc.ds_data, "Nom");
export const getDateNaissanceValue = (doc: DossierRecord) => getPublicFieldValue(doc.ds_data, "Date de naissance");

export const getDateFinAPT = (dossier: DossierRecord) => asDate(getDateDebutAPTValue(dossier));
export const getDateDebutAPT = (dossier: DossierRecord) => asDate(getDateFinAPTValue(dossier));


export const getDateDebutInstruction = (doc: DossierRecord) => asDate(doc.metadata.received_at);
export const getDateDebutConstruction = (doc: DossierRecord) => asDate(doc.metadata.initiated_at);

export const isLong = (doc: DossierRecord) => {
    const startDate = getDateDebutAPT(doc);
    const endDate = getDateFinAPT(doc);
    if (!startDate || !endDate) {
        return false;
    }
    return differenceInDays(startDate, endDate) > 90;
};

const getState = (dossier: DossierRecord) => dossier.metadata.state;

export const isInitiated = (dossier: DossierRecord) => getState(dossier) === "initiated";
export const isReceived = (dossier: DossierRecord) => getState(dossier) === "received";
export const isClosed = (dossier: DossierRecord) => getState(dossier) === "closed";
export const isRefused = (dossier: DossierRecord) => getState(dossier) === "refused";
export const isWithoutContinuation = (dossier: DossierRecord) => getState(dossier) === "without_continuation";

export const getNationality = (dossier: DossierRecord) => getPublicFieldValue(dossier.ds_data, 'Nationalité');