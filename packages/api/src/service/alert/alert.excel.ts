import { Stream } from "stream";
import { Alert } from "../../model";
import { asString } from "../../util";
import { createWorkbook } from "../excel.util";

interface RowAlert {
  ds_key: string;
  group: string;
  message: string;
  instructors_history: string;
  url: string;
}

export const exportAlertsInExcel = async (alerts: Alert[], stream: Stream) => {
  const workbook = createWorkbook();
  const worksheet = workbook.addWorksheet(`Dossiers en souffrance`);

  worksheet.columns = [
    { header: "Identifiant", key: "ds_key", width: 15 },
    { header: "Groupe", key: "group", width: 20 },
    { header: "Alerte", key: "message", width: 40 },
    { header: "Instructeurs", key: "instructors_history", width: 30 },
    { header: "Lien", key: "url", width: 30 }
  ];

  alerts
    .map((alert: Alert) => exportRows(alert))
    .forEach((row: RowAlert) => worksheet.addRow(row));

  await workbook.xlsx.write(stream);
};

const exportRows: (alert: Alert) => RowAlert = (alert: Alert) => {
  return {
    ds_key: alert.ds_key,
    group: alert.group.label,
    message: alert.message,
    // tslint:disable-next-line: object-literal-sort-keys
    instructors_history: asString(alert.instructors_history, ", "),
    url: alert.url
  };
};
