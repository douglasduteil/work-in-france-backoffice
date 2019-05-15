import { Observable } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { DossierRecord, getDateDebutAPTValue, getDateFinAPTValue, getDateNaissanceValue, getNomValue, getPrenomValue, hasExpired, ValidityCheck } from "../model";
import { validityCheckRepository } from "../repository";
import { obfuscate } from "../util";

class ValidityCheckService {

    public saveOrUpdate(validityCheck: ValidityCheck): Observable<ValidityCheck> {
        return validityCheckRepository.deleteByDSKey(validityCheck.ds_key).pipe(
            mergeMap(() => validityCheckRepository.add(validityCheck))
        )
    }

    public buildValidityChecks(record: DossierRecord): ValidityCheck {
        return {
            ds_key: record.ds_key,
            siret: record.ds_data.etablissement.siret,
            // tslint:disable-next-line: object-literal-sort-keys
            prenom: obfuscate(getPrenomValue(record)),
            nom: obfuscate(getNomValue(record)),
            date_de_naissance: getDateNaissanceValue(record),
            has_expired: hasExpired(record),
            date_de_debut_apt: getDateDebutAPTValue(record),
            date_de_fin_apt: getDateFinAPTValue(record)
        };
    }
}




export const validityCheckService = new ValidityCheckService();