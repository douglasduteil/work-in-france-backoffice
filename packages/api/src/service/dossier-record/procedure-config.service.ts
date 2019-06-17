import { Observable } from "rxjs";
import { ProcedureConfig } from "../../model";
import { procedureConfigRepository } from "../../repository";

class ProcedureConfigService {
  public all(): Observable<ProcedureConfig[]> {
    return procedureConfigRepository.all();
  }
}

export const procedureConfigService = new ProcedureConfigService();
