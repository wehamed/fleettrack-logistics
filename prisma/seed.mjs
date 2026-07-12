// تصنيفات المصاريف المرجعية المطلوبة في المواصفات (القسم د).
// تُدرَج مرة واحدة ولا تُعَدّ بيانات مالية وهمية.
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const dbPath = path.join(process.cwd(), "dev.db");
const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url: `file:${dbPath}` }) });

const categories = [
  "وقود",
  "صيانة ميكانيكا",
  "إطارات",
  "تأمين",
  "رسوم ترخيص/فحص",
  "مخالفات مرورية",
  "قطع غيار",
];

let added = 0;
for (const name of categories) {
  const existing = await prisma.expenseCategory.findUnique({ where: { name } });
  if (!existing) {
    await prisma.expenseCategory.create({ data: { name } });
    added++;
  }
}

console.log(`تمت إضافة ${added} تصنيف جديد. الإجمالي:`, await prisma.expenseCategory.count());
await prisma.$disconnect();
