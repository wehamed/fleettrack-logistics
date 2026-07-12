import ExcelJS from "exceljs";

export type ExcelRow = {
  kind: string;
  date: string;
  desc: string;
  amount: number;
  sign: 1 | -1;
};

export type ExcelCompany = {
  companyName: string;
  logoUrl: string | null;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
};

export type ExcelSummary = {
  totalRevenue: number;
  totalDirect: number;
  totalGeneral: number;
  totalPayroll: number;
  netProfit: number;
};

function formatNum(subunits: number, currency: string): string {
  const val = (subunits / 100).toFixed(2);
  return `${val} ${currency}`;
}

export async function generateIncomeStatementExcel(opts: {
  company: ExcelCompany;
  summary: ExcelSummary;
  rows: ExcelRow[];
  from: string;
  to: string;
  currency: string;
}): Promise<Buffer> {
  const { company, summary, rows, from, to, currency } = opts;
  const wb = new ExcelJS.Workbook();
  wb.creator = "نظام كنوال المالي";
  wb.created = new Date();

  const ws = wb.addWorksheet("قائمة الدخل");

  const primary = "1D4ED8";
  const green = "059669";
  const red = "DC2626";
  const darkText = "1E293B";
  const grayText = "64748B";
  const lightBg = "F8FAFC";
  const headerBg = "EFF6FF";

  ws.columns = [
    { width: 22 },
    { width: 16 },
    { width: 45 },
    { width: 20 },
  ];

  let row = 1;

  // ─── Company header ───
  ws.mergeCells(row, 1, row, 4);
  const titleCell = ws.getCell(row, 1);
  titleCell.value = company.companyName || "نظام كنوال المالي";
  titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF" + primary } };
  titleCell.alignment = { horizontal: "right", vertical: "middle" };
  ws.getRow(row).height = 28;
  row++;

  if (company.address) {
    ws.mergeCells(row, 1, row, 4);
    const addrCell = ws.getCell(row, 1);
    addrCell.value = company.address;
    addrCell.font = { name: "Arial", size: 9, color: { argb: "FF" + grayText } };
    addrCell.alignment = { horizontal: "right" };
    row++;
  }

  const contactParts = [company.phone, company.email, company.taxNumber ? `الرقم الضريبي: ${company.taxNumber}` : ""].filter(Boolean).join("  •  ");
  if (contactParts) {
    ws.mergeCells(row, 1, row, 4);
    const cCell = ws.getCell(row, 1);
    cCell.value = contactParts;
    cCell.font = { name: "Arial", size: 8, color: { argb: "FF" + grayText } };
    cCell.alignment = { horizontal: "right" };
    row++;
  }

  row++;

  // ─── Report title ───
  ws.mergeCells(row, 1, row, 4);
  const rTitleCell = ws.getCell(row, 1);
  rTitleCell.value = `قائمة الدخل التفصيلية — الفترة: ${from} ← ${to}`;
  rTitleCell.font = { name: "Arial", size: 12, bold: true, color: { argb: "FF" + darkText } };
  rTitleCell.alignment = { horizontal: "right" };
  ws.getRow(row).height = 24;
  row++;
  row++;

  // ─── Summary ───
  const summaryItems = [
    { label: "إجمالي الإيرادات", value: formatNum(summary.totalRevenue, currency), color: green },
    { label: "المصروفات المباشرة", value: formatNum(summary.totalDirect, currency), color: red },
    { label: "المصاريف العامة", value: formatNum(summary.totalGeneral, currency), color: red },
    { label: "الرواتب", value: formatNum(summary.totalPayroll, currency), color: red },
    { label: "صافي الربح", value: formatNum(summary.netProfit, currency), color: summary.netProfit >= 0 ? green : red },
  ];

  for (const item of summaryItems) {
    ws.getCell(row, 1).value = item.label;
    ws.getCell(row, 1).font = { name: "Arial", size: 9, color: { argb: "FF" + grayText } };
    ws.getCell(row, 1).alignment = { horizontal: "right" };

    ws.mergeCells(row, 2, row, 4);
    const valCell = ws.getCell(row, 2);
    valCell.value = item.value;
    valCell.font = { name: "Arial", size: 11, bold: true, color: { argb: "FF" + item.color } };
    valCell.alignment = { horizontal: "right" };
    ws.getRow(row).height = 20;
    row++;
  }

  row++;

  // ─── Table header ───
  const tableHeaders = ["النوع", "التاريخ", "البيان", "المبلغ"];
  const headerRow = ws.getRow(row);
  tableHeaders.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF" + darkText } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + headerBg } };
    cell.border = {
      bottom: { style: "medium" as const, color: { argb: "FF" + primary } },
    };
    cell.alignment = { horizontal: "right", vertical: "middle" };
  });
  headerRow.height = 24;
  row++;

  // ─── Table rows ───
  for (const r of rows) {
    const dataRow = ws.getRow(row);
    const amountText = `${r.sign > 0 ? "+" : "−"}${formatNum(r.amount, currency)}`;
    const rowColor = r.sign > 0 ? green : red;

    dataRow.getCell(1).value = r.kind;
    dataRow.getCell(1).font = { name: "Arial", size: 9, color: { argb: "FF" + rowColor } };

    dataRow.getCell(2).value = r.date;
    dataRow.getCell(2).font = { name: "Arial", size: 9, color: { argb: "FF" + grayText } };

    dataRow.getCell(3).value = r.desc;
    dataRow.getCell(3).font = { name: "Arial", size: 9, color: { argb: "FF" + darkText } };

    dataRow.getCell(4).value = amountText;
    dataRow.getCell(4).font = { name: "Arial", size: 9, bold: true, color: { argb: "FF" + rowColor } };
    dataRow.getCell(4).alignment = { horizontal: "left" };

    [1, 2, 3, 4].forEach((c) => {
      dataRow.getCell(c).alignment = { ...(dataRow.getCell(c).alignment || {}), horizontal: "right", vertical: "middle" };
    });
    dataRow.getCell(4).alignment = { horizontal: "left", vertical: "middle" };

    if (row % 2 === 0) {
      [1, 2, 3, 4].forEach((c) => {
        dataRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + lightBg } };
      });
    }

    dataRow.height = 20;
    row++;
  }

  if (rows.length === 0) {
    ws.mergeCells(row, 1, row, 4);
    const emptyCell = ws.getCell(row, 1);
    emptyCell.value = "لا توجد حركات في هذه الفترة";
    emptyCell.font = { name: "Arial", size: 10, color: { argb: "FF" + grayText } };
    emptyCell.alignment = { horizontal: "center" };
    row++;
  }

  row++;

  // ─── Footer ───
  const now = new Date();
  const generatedAt = new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  ws.mergeCells(row, 1, row, 4);
  const footerCell = ws.getCell(row, 1);
  footerCell.value = `تم إنشاء هذا التقرير في: ${generatedAt}  |  نظام كنوال المالي`;
  footerCell.font = { name: "Arial", size: 8, color: { argb: "FF" + grayText } };
  footerCell.alignment = { horizontal: "center" };

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
