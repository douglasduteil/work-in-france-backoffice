import { Observable } from "rxjs";
import { DeletedData } from "../lib";
import { Alert } from "../model";
import { KintoRepository } from "./kinto.repository";

class AlertRepository extends KintoRepository<Alert> {

    constructor() {
        super("alerts")
    }

    public all(): Observable<Alert[]> {
        return this.collection.all();
    }

    public add(alert: Alert): Observable<Alert> {
        return this.collection.add(alert);
    }

    public deleteByDSKey(dsKey: string): Observable<DeletedData[]> {
        return this.collection.delete(`ds_key="${dsKey}"`);
    }
    public deleteAll(): Observable<DeletedData[]> {
        return this.collection.delete();
    }

}

export const alertRepository = new AlertRepository();