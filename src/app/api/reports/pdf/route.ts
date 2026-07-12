import { NextRequest } from "next/server";
import { getReportDataset } from "@/lib/reports-data";
import { prisma } from "@/lib/prisma";
import { filterByRange, computeSummary, buildStatementRows } from "@/lib/compute-reports";
import { generateIncomeStatementPdf } from "@/lib/pdf-export";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from") ?? "";
  const to = req.nextUrl.searchParams.get("to") ?? "";
  if (!from || !to) {
    return new Response("Missing from/to", { status: 400 });
  }

  const data = await getReportDataset();
  const s = await prisma.companySettings.findUnique({
    where: { id: "singleton" },
    select: {
      companyName: true,
      logoUrl: true,
      address: true,
      phone: true,
      email: true,
      taxNumber: true,
      currency: true,
    },
  });

  const filtered = filterByRange(data, from, to);
  const summary = computeSummary(filtered);
  const rows = buildStatementRows(filtered, data.trucks);

  const pdfBuffer = await generateIncomeStatementPdf({
    company: {
      companyName: s?.companyName ?? "",
      logoUrl: s?.logoUrl ?? null,
      address: s?.address ?? "",
      phone: s?.phone ?? "",
      email: s?.email ?? "",
      taxNumber: s?.taxNumber ?? "",
    },
    summary,
    rows: rows.map((r) => ({
      kind: r.kind,
      date: r.date,
      desc: r.desc,
      amount: r.amount,
      sign: r.sign,
    })),
    from,
    to,
    currency: s?.currency ?? "د.إ",
  });

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="income-statement-${from}-${to}.pdf"`,
    },
  });
}
