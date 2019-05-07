import { DSDossier, getPrivateFieldValue, getPublicFieldValue, hasExpired } from "../model";
import { obfuscate } from "../util";

class ValidityCheckService {

    public extractPublicData(dossier: DSDossier) {
        return {
            ds_id: dossier.id,
            siret: dossier.etablissement.siret,
            // tslint:disable-next-line: object-literal-sort-keys
            prenom: obfuscate(getPublicFieldValue(dossier, "Prénom")),
            nom: obfuscate(getPublicFieldValue(dossier, "Nom")),
            date_de_naissance: getPublicFieldValue(dossier, "Date de naissance"),
            has_expired: hasExpired(dossier),
            date_de_debut_apt: getPrivateFieldValue(dossier, "Date de début APT"),
            date_de_fin_apt: getPrivateFieldValue(dossier, "Date de fin APT")
        };
    }

}




export const validityCheckService = new ValidityCheckService();