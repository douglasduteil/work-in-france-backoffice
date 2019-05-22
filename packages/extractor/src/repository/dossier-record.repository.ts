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

    public allByProcessedAtBetween(start: number, end: number): Observable<DossierRecord[]> {
        return this.collection.search(`gt_metadata.processed_at=${start}&lt_metadata.processed_at=${end}`);
    }

    public allByState(state: string): Observable<DossierRecord[]> {
        return this.collection.search(`metadata.state="${state}"`);
    }

}

export const dossierRecordRepository = new DossierRecordRepository();