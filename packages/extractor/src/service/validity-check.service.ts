import { EMPTY, Observable } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { DeletedData } from "../lib";
import { DossierRecord, getDateDebutAPTValue, getDateFinAPTValue, getDateNaissanceValue, getNomValue, getPrenomValue, hasExpired, ValidityCheck } from "../model";
import { validityCheckRepository } from "../repository";
import { obfuscate } from "../util";

class ValidityCheckService {

    public isValid(record: DossierRecord) {
        return !hasExpired(record);
    }

    public addIfNotExists(record: DossierRecord): Observable<ValidityCheck> {
        const validityCheck = {
            ds_key: record.ds_key,
            siret: record.ds_data.etablissement.siret,
            // tslint:disable-next-line: object-literal-sort-keys
            prenom: obfuscate(getPrenomValue(record)),
            nom: obfuscate(getNomValue(record)),
            date_de_naissance: getDateNaissanceValue(record),
            has_expired: hasExpired(record),
            date_de_debut_apt: getDateDebutAPTValue(record),
            date_de_fin_apt: getDateFinAPTValue(record)
        }
        return validityCheckRepository.findByDSKey(validityCheck.ds_key).pipe(
            mergeMap(res => {
                if (res.length > 0) {
                    return EMPTY;
                }
                return validityCheckRepository.add(validityCheck);
            })
        )

    }

    public deleteAll(): Observable<DeletedData[]> {
        return validityCheckRepository.deleteAll();
    }

}




export const validityCheckService = new ValidityCheckService();