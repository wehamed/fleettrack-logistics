import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { promisify } from "util";

export type PdfRow = {
  kind: string;
  date: string;
  desc: string;
  amount: number;
  sign: 1 | -1;
};

export type PdfCompany = {
  companyName: string;
  logoUrl: string | null;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
};

export type PdfSummary = {
  totalRevenue: number;
  totalDirect: number;
  totalGeneral: number;
  totalPayroll: number;
  netProfit: number;
};

function fmt(subunits: number, currency: string): string {
  return `${(subunits / 100).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildHtml(opts: {
  company: PdfCompany;
  summary: PdfSummary;
  rows: PdfRow[];
  from: string;
  to: string;
  currency: string;
  generatedAt: string;
  fontBase64: { regular: string; bold: string };
}): string {
  const { company, summary, rows, from, to, currency, generatedAt, fontBase64 } = opts;

  const profitColor = summary.netProfit >= 0 ? "#0d6e3f" : "#dc2626";

  const rowsHtml = rows
    .map((r) => {
      const color = r.sign > 0 ? "#0d6e3f" : "#dc2626";
      const prefix = r.sign > 0 ? "+" : "\u2212";
      return `<tr>
        <td style="color:${color};font-weight:600">${escHtml(r.kind)}</td>
        <td style="color:#6b7280">${escHtml(r.date)}</td>
        <td>${escHtml(r.desc.length > 40 ? r.desc.slice(0, 40) + "\u2026" : r.desc)}</td>
        <td style="color:${color};font-weight:700;direction:ltr;text-align:right">${prefix} ${fmt(r.amount, currency)}</td>
      </tr>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8"/>
<style>
@font-face { font-family: 'Tajawal'; src: url(data:font/ttf;base64,${fontBase64.regular}) format('truetype'); font-weight: 400; }
@font-face { font-family: 'Tajawal'; src: url(data:font/ttf;base64,${fontBase64.bold}) format('truetype'); font-weight: 700; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Tajawal', Arial, sans-serif; font-size: 11px; color: #1e2129; direction: rtl; padding: 30px; }
.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #0e4fd6; padding-bottom: 15px; }
.header-right { text-align: right; }
.header-right h1 { font-size: 18px; font-weight: 700; color: #1e2129; }
.header-right p { font-size: 10px; color: #64748b; margin-top: 2px; }
.header-left { text-align: left; }
.header-left img { height: 45px; }
.header-left .no-logo { width: 45px; height: 45px; background: #0e4fd6; color: white; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; border-radius: 8px; }
.title { font-size: 15px; font-weight: 700; margin: 15px 0 5px; }
.period { font-size: 10px; color: #64748b; margin-bottom: 15px; }
.summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 20px; }
.summary-box { background: #f8f9fa; border: 1px solid #e2e5e9; border-radius: 6px; padding: 10px; }
.summary-box .label { font-size: 9px; color: #64748b; margin-bottom: 4px; }
.summary-box .value { font-size: 13px; font-weight: 700; }
table { width: 100%; border-collapse: collapse; margin-top: 10px; }
thead { background: #f1f3f5; }
th { padding: 8px 10px; font-size: 10px; font-weight: 700; color: #1e2129; border-bottom: 2px solid #dee2e6; text-align: right; }
td { padding: 6px 10px; font-size: 10px; border-bottom: 1px solid #f1f3f5; text-align: right; }
tr:nth-child(even) { background: #fafbfc; }
.footer { margin-top: 30px; border-top: 1px solid #e2e5e9; padding-top: 10px; display: flex; justify-content: space-between; font-size: 8px; color: #94a3b8; }
@media print { body { padding: 20px; } }
</style>
</head>
<body>

<div class="header">
  <div class="header-right">
    <h1>${escHtml(company.companyName || "نظام كنوال المالي")}</h1>
    ${company.address ? `<p>${escHtml(company.address)}</p>` : ""}
    ${[company.phone, company.email, company.taxNumber ? `الرقم الضريبي: ${company.taxNumber}` : ""].filter(Boolean).length ? `<p>${escHtml([company.phone, company.email, company.taxNumber ? `الرقم الضريبي: ${company.taxNumber}` : ""].filter(Boolean).join(" \u2022 "))}</p>` : ""}
  </div>
  <div class="header-left">
    ${company.logoUrl ? `<img src="${escHtml(company.logoUrl)}" alt="logo"/>` : `<div class="no-logo">KW</div>`}
  </div>
</div>

<div class="title">قائمة الدخل التفصيلية</div>
<div class="period">الفترة: ${escHtml(from)} \u2190 ${escHtml(to)}</div>

<div class="summary">
  <div class="summary-box"><div class="label">إجمالي الإيرادات</div><div class="value" style="color:#0d6e3f">${fmt(summary.totalRevenue, currency)}</div></div>
  <div class="summary-box"><div class="label">المصروفات المباشرة</div><div class="value" style="color:#dc2626">${fmt(summary.totalDirect, currency)}</div></div>
  <div class="summary-box"><div class="label">المصاريف العامة</div><div class="value" style="color:#dc2626">${fmt(summary.totalGeneral, currency)}</div></div>
  <div class="summary-box"><div class="label">الرواتب</div><div class="value" style="color:#dc2626">${fmt(summary.totalPayroll, currency)}</div></div>
  <div class="summary-box"><div class="label">صافي الربح</div><div class="value" style="color:${profitColor}">${fmt(summary.netProfit, currency)}</div></div>
</div>

<table>
<thead><tr><th>النوع</th><th>التاريخ</th><th>البيان</th><th style="direction:ltr;text-align:right">المبلغ</th></tr></thead>
<tbody>
${rowsHtml || `<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:20px">لا توجد حركات في هذه الفترة</td></tr>`}
</tbody>
</table>

<div class="footer">
  <span>تم إنشاء هذا التقرير في: ${generatedAt}</span>
  <span>نظام كنوال المالي \u2014 تقرير قائمة الدخل</span>
</div>

</body>
</html>`;
}

export async function generateIncomeStatementPdf(opts: {
  company: PdfCompany;
  summary: PdfSummary;
  rows: PdfRow[];
  from: string;
  to: string;
  currency: string;
}): Promise<Buffer> {
  const fontDir = path.join(process.cwd(), "public", "fonts");
  const regularBytes = fs.readFileSync(path.join(fontDir, "Tajawal-Regular.ttf"));
  const boldBytes = fs.readFileSync(path.join(fontDir, "Tajawal-Bold.ttf"));
  const fontBase64 = {
    regular: regularBytes.toString("base64"),
    bold: boldBytes.toString("base64"),
  };

  const generatedAt = new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const html = buildHtml({ ...opts, generatedAt, fontBase64 });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 30000 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
      displayHeaderFooter: false,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
