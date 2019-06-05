import { Observable } from "rxjs";
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

    public findByDSKeyAndCode(dsKey: string, code: number): Observable<Alert[]> {
        return this.collection.search(`ds_key="${dsKey}"&code=${code}`);
    }
}

export const alertRepository = new AlertRepository();