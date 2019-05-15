import { Observable } from "rxjs";
import { DeletedData } from "../lib";
import { Alert } from "../model";
import { KintoRepository } from "./kinto.repository";

class AlertRepository extends KintoRepository<Alert> {

    constructor() {
        super("alerts")
    }

    public add(alert: Alert): Observable<Alert> {
        return this.collection.add(alert);
    }

    public deleteByDSKey(dsKey: string): Observable<DeletedData[]> {
        return this.collection.delete(`ds_key="${dsKey}"`);
    }

}

export const alertRepository = new AlertRepository();