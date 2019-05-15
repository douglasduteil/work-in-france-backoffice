import { IIdentifiable } from "../util";
import { DSGroup } from "./dossier-record.model";

export interface Alert extends IIdentifiable {
    ds_key: string;
    group: DSGroup;
    messages: string[];
}