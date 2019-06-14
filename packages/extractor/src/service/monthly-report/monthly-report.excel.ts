import { format } from "date-fns";
import { Workbook, Worksheet } from "exceljs";
import { from, Observable } from "rxjs";
import { Stream } from "stream";
import {
  MonthlyReport,
  MonthlyReportCounter
} from "../../model/monthly-report.model";
import {
  addBorder,
  alignCenter,
  createWorkbook,
  fontBold,
  fontTitle,
  fontTitle2
} from "../excel.util";

class ExcelBuilder {
  public workbook!: Workbook;
  private worksheet!: Worksheet;

  private colLeft = 2;
  private colRight = 7;

  public initWorkbook() {
    this.workbook = createWorkbook();
  }

  public createWorkSheet(title: string) {
    this.worksheet = this.workbook.addWorksheet(title);
    this.worksheet.getColumn(this.colLeft).width = 15;
    this.worksheet.getColumn(this.colLeft + 1).width = 15;
    this.worksheet.getColumn(this.colRight).width = 15;
    this.worksheet.getColumn(this.colRight + 1).width = 15;
  }

  public addTitle(title: string) {
    const cell = this.cell(2, 2);
    fontTitle(cell);
    alignCenter(cell);
    addBorder(cell, "double");
    cell.value = title;

    this.worksheet.mergeCells(2, 2, 2, 10);
  }

  public addDossierUrls(row: number, col: number, array: string[]) {
    array.forEach((label, index) => {
      this.worksheet.mergeCells(row + index, col, row + index, col + 4);
      const cell = this.cell(row + index, col);
      alignCenter(cell);
      cell.value = label;
    });
  }

  public addData(row: number, col: number, data: any, headers?: string[]) {
    if (headers) {
      headers.forEach((header, index) => {
        const cell = this.cell(row, col + index);
        fontBold(cell);
        alignCenter(cell);
        cell.value = header;
      });
      row = row + 1;
    }
    Object.keys(data).forEach((label, index) => {
      const labelCell = this.cell(row + index, col);
      const valueCell = this.cell(row + index, col + 1);
      alignCenter(labelCell);
      alignCenter(valueCell);
      labelCell.value = label;
      valueCell.value = data[label];
    });
  }

  public addAPT(
    title: string,
    row: number,
    col: number,
    report: MonthlyReportCounter
  ) {
    const titleCell = this.worksheet.getRow(row).getCell(col);
    titleCell.value = title;
    fontTitle2(titleCell);
    addBorder(titleCell, "thin");
    this.worksheet.mergeCells(row, col, row, col + 3);
    this.addData(row + 2, col, {
      Acceptées: report.count
    });

    const subTitleCell = this.cell(row + 4, col);
    subTitleCell.value = "Top 10 des nationalités les plus concernées";
    subTitleCell.font = { size: 12, bold: true, underline: true };
    this.worksheet.mergeCells(row + 4, col, row + 4, col + 3);

    const keys = Object.keys(report.countries).sort(
      (a, b) => report.countries[b] - report.countries[a]
    );
    const countries = report.countries;

    const countriesData: any = {};

    keys.forEach((key: string) => {
      if (Object.keys(countriesData).length <= 10) {
        countriesData[key] = countries[key];
      }
    });

    this.addData(row + 6, col, countriesData, ["Nationalité", "Nombre"]);
  }

  private cell(row: number, col: number) {
    return this.worksheet.getCell(row, col);
  }
}

export const writeMonthlyReport: (
  report: MonthlyReport,
  stream: Stream
) => Observable<void> = (report: MonthlyReport, stream: Stream) => {
  const builder = new ExcelBuilder();
  const monthDate = new Date(report.year, report.month, 1);
  const monthNumber = format(monthDate, "MM");

  builder.initWorkbook();
  builder.createWorkSheet(`${report.year}-${monthNumber} - Synthèse`);

  // worksheet title
  builder.addTitle("Rapport Mensuel - synthèse");

  builder.addData(4, 2, {
    Année: `${report.year}`,
    Mois: format(monthDate, "MMMM"),
    // tslint:disable-next-line: object-literal-sort-keys
    Département: report.group.label
  });

  builder.addData(4, 7, {
    "APT acceptées":
      report.accepted.less3Months.count + report.accepted.more3Months.count,
    "APT refusées": report.refused.count,
    "APT sans suite": report.withoutContinuation.count
  });

  builder.addAPT("APT + 3mois", 10, 2, report.accepted.more3Months);
  builder.addAPT("APT - 3mois", 10, 7, report.accepted.less3Months);

  if (report.refused.dossiers && report.refused.dossiers.length > 0) {
    builder.createWorkSheet(`${report.year}-${monthNumber} - dossier refusés`);
    builder.addTitle("Rapport Mensuel - dossiers refusés");

    builder.addDossierUrls(4, 2, report.refused.dossiers);
  }

  // await builder.workbook.xlsx.writeFile(`excel/WIF_${report.year}-${monthNumber}_ud${report.group.id}.xlsx`);
  return from(builder.workbook.xlsx.write(stream));
};
