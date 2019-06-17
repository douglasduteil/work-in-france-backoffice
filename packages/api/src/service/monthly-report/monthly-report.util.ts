import { format } from "date-fns";

export const getMonthlyReportFilename = (
  year: number,
  month: number,
  groupId: string
) => {
  const monthDate = new Date(year, month, 1);
  const monthNumber = format(monthDate, "MM");
  return `WIF_${year}-${monthNumber}_ud${groupId}.xlsx`;
};
