import { Observable } from "rxjs";
import { configuration } from "../config";
import { kintoClient, KintoCollection } from "../lib";
import { ProcedureConfig } from "../model";

class ProcedureConfigRepository {
  private collection: KintoCollection<ProcedureConfig>;

  constructor() {
    const kintoAPI = configuration.dsAPI || "";
    const kintoLogin = configuration.dsApiLogin || "";
    const kintoPassword = configuration.dsApiPasssword || "";
    this.collection = kintoClient(
      kintoAPI,
      kintoLogin,
      kintoPassword
    ).collection<ProcedureConfig>("ds_configs");
  }

  public all(): Observable<ProcedureConfig[]> {
    return this.collection.all();
  }
}

export const procedureConfigRepository = new ProcedureConfigRepository();
