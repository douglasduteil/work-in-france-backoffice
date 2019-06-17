import { BorderStyle, Cell, Workbook } from "exceljs";

export const createWorkbook = () => {
  const workbook = new Workbook();
  workbook.creator = "Work In France";
  workbook.lastModifiedBy = "Work In France";
  workbook.created = new Date();
  workbook.modified = new Date();
  return workbook;
};

export const alignCenter = (cell: Cell) => {
  cell.alignment = { vertical: "middle", horizontal: "center" };
};

export const fontBold = (cell: Cell) => {
  cell.font = { bold: true };
};

export const fontTitle = (cell: Cell) => {
  cell.font = { size: 16, bold: true };
};

export const fontTitle2 = (cell: Cell) => {
  cell.font = { size: 14, bold: true };
};

export const addBorder = (cell: Cell, style: BorderStyle) => {
  cell.border = {
    top: { style },
    // tslint:disable-next-line: object-literal-sort-keys
    left: { style },
    bottom: { style },
    right: { style }
  };
};
