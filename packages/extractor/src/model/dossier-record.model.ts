import { IIdentifiable } from "../util";

export interface DSChamp {
    value: string;
    type_de_champ: {
        libelle: string;
    }
}

interface DSEtablissement {
    siret: string;
}

export interface DSDossier {
    id: number;
    etablissement: DSEtablissement;
    champs: DSChamp[];
    champs_private: DSChamp[];

}

export interface DossierRecord extends IIdentifiable {
    ds_key: string;
    ds_data: DSDossier;
    metadata: {
        state: string;
        procedure_id: string;
        created_at: number;
        // date de la dernière modification du dossier
        updated_at: number | null;
        // date du passage en instruction
        received_at: number | null;
        // date de décision du dossier
        processed_at: number | null;
    }
}

export const getFieldValue = (champs: DSChamp[], libelle: string) => {
    const field = champs.find(f => f.type_de_champ.libelle === libelle);
    if (!field) {
        throw new Error(`field ${libelle} does not exists`);
    }
    return field.value;
};

export const getPublicFieldValue = (dossier: DSDossier, libelle: string) =>
    getFieldValue(dossier.champs, libelle);

export const getPrivateFieldValue = (dossier: DSDossier, libelle: string) =>
    getFieldValue(dossier.champs_private, libelle);

export const hasExpired = (doc: any): boolean => {
    const endDate = getPrivateFieldValue(doc, "Date de fin APT");
    if (!endDate) {
        return true;
    }
    if (new Date(endDate) < new Date()) {
        return true;
    }
    return false;
};