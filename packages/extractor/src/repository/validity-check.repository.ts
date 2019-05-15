import { Observable } from "rxjs";
import { configuration } from "../config";
import { DeletedData, kintoClient, KintoCollection } from "../lib";
import { ValidityCheck } from "../model";

class ValidityCheckRepository {

    private kintoAPI = configuration.kintoAPI;
    private kintoLogin = configuration.kintoLogin;
    private kintoPassword = configuration.kintoPassword;
    private collection: KintoCollection<ValidityCheck>;

    constructor() {
        this.collection = kintoClient(this.kintoAPI, this.kintoLogin, this.kintoPassword).collection('validity_checks');
    }

    public update(id: string, record: ValidityCheck): Observable<ValidityCheck> {
        return this.collection.update(id, record);
    }
    public add(validityCheck: ValidityCheck): Observable<ValidityCheck> {
        return this.collection.add(validityCheck);
    }

    public deleteByDSKey(dsKey: string): Observable<DeletedData[]> {
        return this.collection.delete(`ds_key="${dsKey}"`);
    }

}

export const validityCheckRepository = new ValidityCheckRepository();