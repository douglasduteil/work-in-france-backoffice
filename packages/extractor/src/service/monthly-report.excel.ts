import { format } from "date-fns";
import { BorderStyle, Cell, Workbook, Worksheet } from "exceljs";
import { MonthlyReport, MonthlyReportCounter } from "../model/monthly-report.model";

class ExcelBuilder {

    public workbook!: Workbook;
    private worksheet!: Worksheet;

    private colLeft = 2;
    private colRight = 7;

    public createWorkbook() {
        this.workbook = new Workbook();
        this.workbook.creator = 'Work In France';
        this.workbook.lastModifiedBy = 'Work In France';
        this.workbook.created = new Date();
        this.workbook.modified = new Date();
    }

    public createWorkSheet(title: string) {
        this.worksheet = this.workbook.addWorksheet(title);
        this.worksheet.getColumn(this.colLeft).width = 15;
        this.worksheet.getColumn(this.colLeft + 1).width = 15;
        this.worksheet.getColumn(this.colRight).width = 15;
        this.worksheet.getColumn(this.colRight + 1).width = 15;
    }

    public addTitle(title: string) {
        const cell = this.worksheet.getRow(2).getCell(2);
        cell.value = title;
        cell.font = { size: 16, bold: true };
        this.alignCenter(cell);
        this.addBorder(cell, 'double');

        this.worksheet.mergeCells(2, 2, 2, 10);
    }

    public addData(row: number, col: number, data: any) {
        Object.keys(data).forEach((label, index) => {
            this.worksheet.getRow(row + index).getCell(col).value = label;
            this.worksheet.getRow(row + index).getCell(col + 1).value = data[label];
        })
    }

    public addAPT(title: string, row: number, col: number, report: MonthlyReportCounter) {

        const titleCell = this.worksheet.getRow(row).getCell(col);
        titleCell.value = title;
        titleCell.font = { size: 14, bold: true };
        this.addBorder(titleCell, 'thin');
        this.worksheet.mergeCells(row, col, row, col + 3);
        this.addData(row + 2, col, {
            'Acceptées': report.count,
        });

        const subTitleCell = this.worksheet.getRow(row + 4).getCell(col);
        subTitleCell.value = 'Top 10 des nationalités les plus concernées';
        subTitleCell.font = { size: 12, bold: true, underline: true };
        this.worksheet.mergeCells(row + 4, col, row + 4, col + 3);

        this.addData(row + 6, col, report.countries);
    }

    private alignCenter(cell: Cell) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
    private addBorder(cell: Cell, style: BorderStyle) {
        cell.border = {
            top: { style },
            // tslint:disable-next-line: object-literal-sort-keys
            left: { style },
            bottom: { style },
            right: { style }
        };
    }

}

export const generateMonthlyReport = async (report: MonthlyReport) => {
    const builder = new ExcelBuilder();
    const monthDate = new Date(report.year, report.month, 1);
    const monthNumber = format(monthDate, 'MM');

    builder.createWorkbook();
    builder.createWorkSheet(`${report.group.label} - ${report.year}-${monthNumber}`);

    // worksheet title
    builder.addTitle('Work In France:  Rapport Mensuel');

    builder.addData(4, 2, {
        'Année': `${report.year}`,
        'Mois': format(monthDate, 'MMMM'),
        // tslint:disable-next-line: object-literal-sort-keys
        'Département': report.group.label,
    });

    builder.addData(4, 7, {
        'APT acceptées': report.accepted.more3Months.count + report.accepted.more3Months.count,
        'APT refusées': report.refused.count,
        'APT sans suite': report.withoutContinuation.count
    });

    builder.addAPT("APT + 3mois", 10, 2, report.accepted.more3Months);
    builder.addAPT("APT - 3mois", 10, 7, report.accepted.less3Months);

    await builder.workbook.xlsx.writeFile(`excel/WIF_${report.year}-${monthNumber}_ud${report.group.id}.xlsx`);

}