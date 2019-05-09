import { Observable } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { DossierRecord, getPrivateFieldValue, getPublicFieldValue, hasExpired, ValidityCheck } from "../model";
import { validityCheckRepository } from "../repository";
import { logger, obfuscate } from "../util";

class ValidityCheckService {

    public saveOrUpdate(validityCheck: ValidityCheck): Observable<ValidityCheck> {
        return validityCheckRepository.findByDSKey(validityCheck.ds_key).pipe(
            mergeMap((res: ValidityCheck[]) => {
                if (res.length === 0) {
                    logger.debug(`[ValidityCheckService.saveOrUpdate] add validity check for ds_key ${validityCheck.ds_key}`)
                    return validityCheckRepository.add(validityCheck);
                } else {
                    const record: ValidityCheck = res[0];
                    logger.debug(`[ValidityCheckService.saveOrUpdate] update validity check with ds_key ${validityCheck.ds_key}`)
                    Object.assign(record, validityCheck);
                    return validityCheckRepository.update(record.id || '', record);
                }
            })
        )
    }

    public buildValidityChecks(record: DossierRecord): ValidityCheck {
        const dossier = record.ds_data;
        return {
            ds_key: record.ds_key,
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