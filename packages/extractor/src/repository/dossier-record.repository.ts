import { Observable } from "rxjs";
import { configuration } from "../config";
import { kintoClient, KintoCollection } from "../lib";
import { DossierRecord } from "../model";

class DossierRecordRepository {

    private collection: KintoCollection<DossierRecord>;

    constructor() {
        const kintoAPI = configuration.dsAPI || '';
        const kintoLogin = configuration.dsApiLogin || '';
        const kintoPassword = configuration.dsApiPasssword || '';
        this.collection = kintoClient(kintoAPI, kintoLogin, kintoPassword).collection<DossierRecord>("dossiers")
    }

    public all(): Observable<DossierRecord[]> {
        return this.collection.all();
    };

}

export const dossierRecordRepository = new DossierRecordRepository();