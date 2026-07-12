// بذر بيانات تجريبية حقيقية لكل كيانات نظام كنوال المالي.
// يشغّل يدويًا: node seed-demo.mjs  (من جذر المشروع)
// يستخدم libsql adapter لـ SQLite المحلي

import path from "path";
import { fileURLToPath } from "url";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { PrismaLibSql } from "@prisma/adapter-libsql";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adapter = new PrismaLibSql({ url: `file:${path.resolve(__dirname, "dev.db")}` });
const prisma = new PrismaClient({ adapter });

// د.إ -> قرش (أصغر وحدة)
const E = (dirham) => Math.round(dirham * 100);

// مولّد عشوائي حتمي لبيانات متنوعة لكن قابلة لإعادة الإنتاج
let _s = 987654321;
function rnd() {
  _s = (_s * 1103515245 + 12345) & 0x7fffffff;
  return _s / 0x7fffffff;
}
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const between = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const dayOf = (m, d) => new Date(2026, m - 1, d);

const categories = [
  "وقود", "قطع غيار", "صيانة دورية", "إطارات", "تأمين أسطول", "تراخيص وفحص",
  "إيجار مكتب", "كهرباء وهاتف",
];

const truckDefs = [
  { plate: "أ ب ج 1245", model: "مرسيدس أكتروس", year: 2021 },
  { plate: "د هـ و 3320", model: "مان تي جي إس", year: 2020 },
  { plate: "ح ط ي 7781", model: "فولفو إف إتش", year: 2022 },
  { plate: "ك ل م 5092", model: "سكانيا آر", year: 2019 },
  { plate: "ن س ع 6610", model: "مرسيدس أكتروس", year: 2023 },
  { plate: "ع ف ص 2143", model: "مان تي جي إس", year: 2021 },
  { plate: "ق ر ش 8800", model: "فولفو إف إتش", year: 2020 },
  { plate: "ت ث خ 4455", model: "سكانيا آر", year: 2022 },
  { plate: "ج ح ض 9921", model: "مرسيدس أكتروس", year: 2024 },
];

const employeeDefs = [
  { name: "أحمد محمد علي", role: "سائق", salaryType: "ثابت", base: 6000 },
  { name: "محمود عبد الله", role: "سائق", salaryType: "ثابت", base: 6000 },
  { name: "خالد سعيد", role: "سائق", salaryType: "بالرحلة", base: 5500 },
  { name: "ياسر حسن", role: "سائق", salaryType: "نسبة", base: 6200 },
  { name: "عمر فتحي", role: "سائق", salaryType: "ثابت", base: 5800 },
  { name: "سعيد محمود", role: "سائق", salaryType: "بالرحلة", base: 6100 },
  { name: "إبراهيم نجيب", role: "فني", salaryType: "ثابت", base: 6000 },
  { name: "مصطفى كمال", role: "فني", salaryType: "ثابت", base: 6300 },
  { name: "طارق عادل", role: "فني", salaryType: "نسبة", base: 8000 },
  { name: "وليد رمضان", role: "إداري", salaryType: "ثابت", base: 7000 },
  { name: "هاني عبد الرحمن", role: "إداري", salaryType: "ثابت", base: 5700 },
];

const clients = [
  "شركة مصر للأسمنت",
  "مؤسسة الراجحي للتعمير",
  "شركة الخليج للحاويات",
  "مصنع النور للطوب",
  "شركة الأفق للخدمات اللوجستية",
  "مؤسسة البناء الحديث",
  "شركة الواحة للنقل",
  "مصنع الشرق للحديد",
];
const destinations = [
  "الرياض - جدة",
  "الدمام - الأحساء",
  "مكة - الطائف",
  "المدينة - ينبع",
  "أبها - خميس مشيط",
  "تبوك - ضباء",
  "القصيم - بريدة",
  "حائل - الجوف",
];
const revenueTypes = ["أجرة نقل", "عقد شهري", "إيجار شاحنة"];
const expenseDescs = [
  "تموين وقود", "استبدال إطارات", "صيانة محرك", "تأمين سنوي", "فحص دوري",
  "إصلاح عطل", "زيت ومصفاة", "أجور سائق",
];

async function main() {
  // مسح أي بيانات تجريبية سابرة لمنع التكرار
  console.log("مسح البيانات التجريبية القديمة...");
  await prisma.$executeRawUnsafe("DELETE FROM Payroll");
  await prisma.$executeRawUnsafe("DELETE FROM TruckDriverAssignment");
  await prisma.$executeRawUnsafe("DELETE FROM Revenue");
  await prisma.$executeRawUnsafe("DELETE FROM Expense");
  await prisma.$executeRawUnsafe("DELETE FROM Employee");
  await prisma.$executeRawUnsafe("DELETE FROM Truck");

  console.log("إدراج التصنيفات...");
  for (const name of categories) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  const allCats = await prisma.expenseCategory.findMany();

  console.log("إدراج الشاحنات...");
  const trucks = [];
  for (const t of truckDefs) {
    const created = await prisma.truck.upsert({
      where: { plateNumber: t.plate },
      update: { model: t.model, year: t.year, status: "تعمل", purchaseDate: dayOf(1, 1), purchaseValue: E(t.year * 150000) },
      create: { plateNumber: t.plate, model: t.model, year: t.year, status: "تعمل", purchaseDate: dayOf(1, 1), purchaseValue: E(t.year * 150000) },
    });
    trucks.push(created);
  }

  console.log("إدراج الموظفين...");
  const employees = [];
  for (const e of employeeDefs) {
    const created = await prisma.employee.create({
      data: {
        name: e.name,
        role: e.role,
        salaryType: e.salaryType,
        baseSalary: E(e.base),
        phone: `05${between(10000000, 99999999)}`,
        hireDate: dayOf(between(1, 12), between(1, 28)),
      },
    });
    employees.push(created);
  }

  console.log("إدراج التكليفات...");
  for (let i = 0; i < trucks.length; i++) {
    const driver = employees.find((e) => e.role === "سائق");
    if (driver) {
      await prisma.truckDriverAssignment.create({
        data: { truckId: trucks[i].id, employeeId: driver.id, startDate: dayOf(1, 1) },
      });
    }
  }

  console.log("إدراج الإيرادات...");
  let revCount = 0;
  for (const truck of trucks) {
    for (let m = 1; m <= 6; m++) {
      for (let k = 0; k < 3; k++) {
        await prisma.revenue.create({
          data: {
            truckId: truck.id,
            date: dayOf(m, between(1, 28)),
            clientName: pick(clients),
            destination: pick(destinations),
            revenueType: pick(revenueTypes),
            amount: E(between(8000, 25000)),
            notes: rnd() < 0.3 ? "دفعة مقدمة" : null,
          },
        });
        revCount++;
      }
    }
  }

  console.log("إدراج المصروفات...");
  let expCount = 0;
  for (const truck of trucks) {
    for (let m = 1; m <= 6; m++) {
      for (let k = 0; k < 2; k++) {
        const cat = pick(allCats);
        await prisma.expense.create({
          data: {
            truckId: truck.id,
            categoryId: cat.id,
            date: dayOf(m, between(1, 28)),
            amount: E(between(500, 3000)),
            description: pick(expenseDescs),
            receiptImage: null,
          },
        });
        expCount++;
      }
    }
  }
  for (let m = 1; m <= 6; m++) {
    for (let k = 0; k < 2; k++) {
      const cat = pick(allCats);
      await prisma.expense.create({
        data: {
          truckId: null,
          categoryId: cat.id,
          date: dayOf(m, between(1, 28)),
          amount: E(between(2500, 7800)),
          description: pick(expenseDescs),
          receiptImage: null,
        },
      });
      expCount++;
    }
  }

  console.log("إدراج الرواتب...");
  let payCount = 0;
  const payrollNotes = {
    clean: ["راتب منتظم", "لم يُسجّل أي خصم أو سلفة", ""],
    dedOnly: ["خصم غياب يومين", "خصم تأخر متكرر", "خصم إداري"],
    advOnly: ["سلفة طارئة", "سلفة شهرية", "سلفة علاج"],
    both: ["خصم + سلفة شهرية", "سلفة وخصم غياب", ""],
    heavy: ["خصم كبير — غياب مطول", "خصم disciplinary"],
  };
  for (const emp of employees) {
    for (let m = 1; m <= 6; m++) {
      const base = emp.baseSalary;
      const roll = rnd();
      let deductions = 0;
      let advances = 0;
      let note = "";
      if (roll < 0.25) {
        // راتب كامل بدون أي شيء
        note = pick(payrollNotes.clean);
      } else if (roll < 0.40) {
        // خصومات فقط
        deductions = E(between(200, 800));
        note = pick(payrollNotes.dedOnly);
      } else if (roll < 0.55) {
        // سلفة فقط
        advances = E(between(800, 3000));
        note = pick(payrollNotes.advOnly);
      } else if (roll < 0.80) {
        // الاتنين مع بعض
        deductions = E(between(150, 500));
        advances = E(between(1000, 2500));
        note = pick(payrollNotes.both);
      } else {
        // خصومات كبيرة
        deductions = E(between(800, 1500));
        note = pick(payrollNotes.heavy);
      }
      const net = base - deductions - advances;
      const paid = m < 6 ? true : rnd() < 0.3;
      await prisma.payroll.create({
        data: {
          employeeId: emp.id,
          month: `2026-${String(m).padStart(2, "0")}`,
          baseAmount: base,
          deductions,
          advances,
          net,
          paid,
          paymentDate: paid ? dayOf(m, 28) : null,
          notes: note || null,
        },
      });
      payCount++;
    }
  }

console.log("إدراج مستخدم افتراضي...");
  await prisma.systemUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: "97e341ea61bcc40c2a15b4df511648d0:7a25ed6d7e508b410bfff6dc227174608d6673a646a8b3813f79c07144c6f62f429d572f4999613e148e811e3a5980e84a23a9f8085e6a690876baccf09b0818",
      displayName: "المدير",
    },
  });

  console.log("إدراج إعدادات الشركة...");
  await prisma.companySettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      companyName: "شركة كنوال للنقل واللوجستيات",
      currency: "د.إ",
      fiscalYearStart: "2026-01-01",
      logoUrl: null,
      address: "مدينة الملك عبد الله الاقتصادية — المملكة العربية السعودية",
      phone: "920000000",
      email: "info@kanwal.sa",
      taxNumber: "300000000000003",
      primaryColor: "#1d4ed8",
      secondaryColor: "#1e293b",
      accentColor: "#10b981",
    },
  });

  console.log(
    `تم البذر: ${trucks.length} شاحنة، ${employees.length} موظف، ${revCount} إيراد، ${expCount} مصروف، ${payCount} راتب.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });