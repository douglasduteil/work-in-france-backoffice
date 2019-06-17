import { differenceInDays } from "date-fns";
import { asDate, IIdentifiable, logger } from "../util";

export interface DSGroup {
  id: string;
  label: string;
}

export interface DSChamp {
  value: string;
  type_de_champ: {
    libelle: string;
  };
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
  instructeurs: string[];
  email: string;
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
    instructors_history: string[];
  };
}

const getFieldValue = (champs: DSChamp[], libelle: string) => {
  const field = champs.find(
    (f: DSChamp) => f.type_de_champ.libelle === libelle
  );
  if (!field) {
    throw new Error(`field ${libelle} does not exists`);
  }
  return field.value;
};

const getPublicFieldValue = (record: DossierRecord, libelle: string) => {
  try {
    return getFieldValue(record.ds_data.champs, libelle);
  } catch (err) {
    logger.error(
      `public field ${libelle} not find for dossier ${record.ds_key}`
    );
    throw err;
  }
};
const getPrivateFieldValue = (record: DossierRecord, libelle: string) => {
  try {
    return getFieldValue(record.ds_data.champs_private, libelle);
  } catch (err) {
    logger.error(
      `private field ${libelle} not find for dossier ${record.ds_key}`
    );
    throw err;
  }
};

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

export const getDateDebutAPTValue = (doc: DossierRecord) =>
  getPrivateFieldValue(doc, "Date de début APT");
export const getDateFinAPTValue = (doc: DossierRecord) =>
  getPrivateFieldValue(doc, "Date de fin APT");
export const getPrenomValue = (doc: DossierRecord) =>
  getPublicFieldValue(doc, "Prénom");
export const getNomValue = (doc: DossierRecord) =>
  getPublicFieldValue(doc, "Nom");
export const getDateNaissanceValue = (doc: DossierRecord) =>
  getPublicFieldValue(doc, "Date de naissance");

export const getDateFinAPT = (dossier: DossierRecord) =>
  asDate(getDateFinAPTValue(dossier));
export const getDateDebutAPT = (dossier: DossierRecord) =>
  asDate(getDateDebutAPTValue(dossier));

export const getDateDebutInstruction = (doc: DossierRecord) =>
  asDate(doc.metadata.received_at);
export const getDateDebutConstruction = (doc: DossierRecord) =>
  asDate(doc.metadata.initiated_at);

export const isLong = (doc: DossierRecord) => {
  const startDate = getDateDebutAPT(doc);
  const endDate = getDateFinAPT(doc);
  if (!startDate || !endDate) {
    return false;
  }
  return differenceInDays(endDate, startDate) + 1 >= 91;
};

const getState = (dossier: DossierRecord) => dossier.metadata.state;

export const isInitiated = (dossier: DossierRecord) =>
  getState(dossier) === "initiated";
export const isReceived = (dossier: DossierRecord) =>
  getState(dossier) === "received";
export const isClosed = (dossier: DossierRecord) =>
  getState(dossier) === "closed";
export const isRefused = (dossier: DossierRecord) =>
  getState(dossier) === "refused";
export const isWithoutContinuation = (dossier: DossierRecord) =>
  getState(dossier) === "without_continuation";

export const getNationality = (dossier: DossierRecord) =>
  getPublicFieldValue(dossier, "Nationalité");

export const getDemarcheSimplifieeUrl = (dossier: DossierRecord) => {
  const keys = dossier.ds_key.split("-");
  const procedureId = keys[0];
  const dossierId = keys[1];
  return `https://www.demarches-simplifiees.fr/procedures/${procedureId}/dossiers/${dossierId}`;
};
