import { IIdentifiable } from "../util";
import { DSGroup } from "./dossier-record.model";

export interface Alert extends IIdentifiable {
  ds_key: string;
  url: string;
  group: DSGroup;
  code: number;
  message: string;
  instructors_history: string[];
  email_id?: string;
  email_user: string;
  sent: boolean;
}

export interface AlertType {
  code: number;
  message: string;
}

export const alertTypes = {
  closedWithoutDateDebut: {
    code: 100,
    message: "dossier accepté, date de début APT manquante"
  },
  closedWithoutDateFin: {
    code: 101,
    message: "dossier accepté, date de fin APT manquante"
  },
  // tslint:disable-next-line: object-literal-sort-keys
  closedWithDebutSupFin: {
    code: 102,
    message: "dossier accepté, date de fin APT antérieure à Date de début APT"
  },
  closedWithSupOneYear: {
    code: 103,
    message: "dossier accepté, durée APT supérieure à 12 mois"
  },
  closedAndMessageReceived: {
    code: 104,
    message: "dossier accepté, message envoyé après acceptation"
  },

  refusedAndMessageReceived: {
    code: 200,
    message: "dossier refusé, message envoyé après refus"
  },

  withoutContinuationAndMessageReceived: {
    code: 300,
    message: "dossier classé sans suite, message après classement sans suite"
  },

  receivedAndDelayTooLong: {
    code: 400,
    message: "durée d'instruction de dossier dépassée"
  },

  initiatedAndDelayTooLong: {
    code: 500,
    message: "durée de construction de dossier dépassée"
  }
};
