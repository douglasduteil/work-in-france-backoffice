import { Observable } from "rxjs";
import { SynchroHistory } from "../model";
import { KintoRepository } from "./kinto.repository";

class SynchroHistoryRepository extends KintoRepository<SynchroHistory> {
  constructor() {
    super("synchro_histories");
  }

  public all(): Observable<SynchroHistory[]> {
    return this.collection.all();
  }

  public add(synchroHistory: SynchroHistory): Observable<SynchroHistory> {
    return this.collection.add(synchroHistory);
  }

  public update(
    id: string,
    synchroHistory: SynchroHistory
  ): Observable<SynchroHistory> {
    return this.collection.update(id, synchroHistory);
  }
}

export const synchroHistoryRepository = new SynchroHistoryRepository();
