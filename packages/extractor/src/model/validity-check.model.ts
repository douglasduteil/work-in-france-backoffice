import { IIdentifiable } from "../util/persistence";

export interface ValidityCheck extends IIdentifiable {
  ds_key: string;
  siret: string;
  prenom: string;
  nom: string;
  date_de_naissance: string;
  has_expired: boolean;
  date_de_debut_apt: string;
  date_de_fin_apt: string;
  metadata: {
    fin_apt: number;
  };
}

// "ds_id": 378335,
// "siret": "000000000000000",
// "prenom": "*y***",
// "nom": "*a******",
// "date_de_naissance": "1990-01-01",
// "has_expired": false,
// "date_de_debut_apt": "2019-03-18",
// "date_de_fin_apt": "2019-11-04"
