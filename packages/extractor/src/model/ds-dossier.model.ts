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

export const hasExpired = (doc: any) => {
    const endDate = getPrivateFieldValue(doc, "Date de fin APT");
    return endDate && new Date(endDate) < new Date();
};