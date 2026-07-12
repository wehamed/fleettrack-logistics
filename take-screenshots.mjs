import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, 'screenshots');
const BASE = 'http://localhost:3000';
let idx = 0;

async function shot(page, name) {
  idx++;
  const n = String(idx).padStart(2, '0');
  await page.screenshot({ path: path.join(DIR, `${n}-${name}.png`), fullPage: false });
  console.log(`  [${n}] ${name}`);
}

async function w(page, ms = 1000) {
  await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(ms);
}

async function go(page, p) {
  await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(800);
}

async function light(page) {
  await page.evaluate(() => { localStorage.setItem('kanwal-theme', 'light'); document.documentElement.classList.remove('dark'); });
  await page.waitForTimeout(200);
}

async function dark(page) {
  await page.evaluate(() => { localStorage.setItem('kanwal-theme', 'dark'); document.documentElement.classList.add('dark'); });
  await page.waitForTimeout(200);
}

async function openDialog(page, btnText) {
  const btn = page.getByRole('button', { name: btnText });
  await btn.scrollIntoViewIfNeeded();
  // Wait for button to be enabled
  await page.waitForFunction(
    (text) => {
      const buttons = [...document.querySelectorAll('button')];
      const b = buttons.find(btn => btn.textContent?.includes(text));
      return b && !b.disabled;
    },
    btnText,
    { timeout: 8000 }
  ).catch(() => console.log(`  (btn "${btnText}" may be disabled)`));
  await btn.click({ timeout: 3000 }).catch(() => {});
  const dialog = page.getByRole('dialog');
  try {
    await dialog.waitFor({ state: 'visible', timeout: 5000 });
  } catch (e) {
    console.log(`  (dialog for "${btnText}" did not open)`);
    return false;
  }
  await page.waitForTimeout(400);
  return true;
}

async function selectFirstOption(page) {
  try {
    // Click any SelectTrigger inside the dialog
    const trigger = page.getByRole('dialog').locator('[data-slot="select-trigger"], [role="combobox"], button[aria-haspopup]').first();
    if (await trigger.count() > 0) {
      await trigger.click();
    } else {
      // Fallback: click a button with placeholder text
      const fb = page.getByRole('dialog').locator('button').filter({ hasText: /اختر|شاحنة|موظف|تصنيف/ }).first();
      if (await fb.count() > 0) await fb.click();
    }
    await page.waitForTimeout(400);
    const opt = page.getByRole('option').first();
    if (await opt.count() > 0) {
      await opt.click();
      await page.waitForTimeout(300);
    }
  } catch (e) {
    console.log(`  (select skipped)`);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);

  console.log('Starting screenshots...\n');

  // ═══ LOGIN ═══
  await go(page, '/login');
  await shot(page, 'login-empty');

  await page.getByLabel('اسم المستخدم').fill('admin');
  await page.getByLabel('كلمة المرور').fill('admin123');
  await shot(page, 'login-filled');

  // ═══ DASHBOARD ═══
  await page.getByRole('button', { name: 'دخول' }).click();
  await page.waitForURL('**/');
  await w(page);
  await light(page);
  await w(page);
  await shot(page, 'dashboard-light');

  await dark(page);
  await w(page);
  await shot(page, 'dashboard-dark');
  await light(page);
  await w(page);

  // ═══ TRUCKS ═══
  await go(page, '/trucks');
  await w(page, 500);
  await shot(page, 'trucks-list');

  try {
    await page.getByRole('button', { name: 'كروت' }).click();
    await page.waitForTimeout(600);
    await shot(page, 'trucks-kanban');
    await page.getByRole('button', { name: 'قائمة' }).click();
    await page.waitForTimeout(300);
  } catch (e) { console.log('  (kanban skipped)'); }

  if (await openDialog(page, 'إضافة شاحنة')) {
    await shot(page, 'trucks-add-empty');

    await page.getByLabel('رقم اللوحة *').fill('س ع و 7890');
    await page.getByLabel('الموديل *').fill('فولفو FH500');
    await page.getByLabel('سنة الصنع').fill('2023');
    await page.getByLabel('قيمة الشراء (بالعملة)').fill('950000');
    await page.waitForTimeout(300);
    await shot(page, 'trucks-add-filled');

    await page.getByRole('button', { name: 'إضافة الشاحنة' }).click();
    await page.waitForTimeout(2500);
    await w(page);
    await shot(page, 'trucks-after-add');
  }

  try {
    // Click the "عرض" (Eye) button in the first row to open detail dialog
    const eyeBtn = page.locator('table tbody tr').first().locator('button[title="عرض"]');
    if (await eyeBtn.count() > 0) {
      await eyeBtn.click();
      await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(800);
      await shot(page, 'truck-detail');
    } else {
      // Fallback: click the row itself
      const row = page.locator('table tbody tr').first();
      if (await row.count() > 0) {
        await row.click();
        await page.waitForTimeout(1500);
        await w(page);
        await shot(page, 'truck-detail');
      }
    }
  } catch (e) { console.log('  (truck detail skipped: ' + e.message?.slice(0, 60) + ')'); }

  // ═══ EMPLOYEES ═══
  await go(page, '/employees');
  await w(page, 500);
  await shot(page, 'employees-list');

  try {
    await page.getByRole('button', { name: 'كروت' }).click();
    await page.waitForTimeout(600);
    await shot(page, 'employees-kanban');
    await page.getByRole('button', { name: 'قائمة' }).click();
    await page.waitForTimeout(300);
  } catch (e) { console.log('  (kanban skipped)'); }

  if (await openDialog(page, 'إضافة موظف')) {
    await shot(page, 'employees-add-empty');

    await page.getByLabel('الاسم *').fill('خالد الشامسي');
    await page.getByLabel('الهاتف').fill('0501234567');
    await page.getByLabel('الراتب الأساسي (بالعملة)').fill('7500');
    await page.waitForTimeout(300);
    await shot(page, 'employees-add-filled');

    await page.getByRole('button', { name: 'إضافة موظف' }).last().click();
    await page.waitForTimeout(2500);
    await w(page);
    await shot(page, 'employees-after-add');
  }

  try {
    const eyeBtn = page.locator('table tbody tr').first().locator('button[title="عرض"]');
    if (await eyeBtn.count() > 0) {
      await eyeBtn.click();
      await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(800);
      await shot(page, 'employee-detail');
    } else {
      const row = page.locator('table tbody tr').first();
      if (await row.count() > 0) {
        await row.click();
        await page.waitForTimeout(1500);
        await w(page);
        await shot(page, 'employee-detail');
      }
    }
  } catch (e) { console.log('  (employee detail skipped: ' + e.message?.slice(0, 60) + ')'); }

  // ═══ REVENUES ═══
  await go(page, '/revenues');
  await w(page, 1500);
  await shot(page, 'revenues-list');

  if (await openDialog(page, 'إضافة إيراد')) {
    await selectFirstOption(page);
    await page.getByLabel('اسم العميل *').fill('شركة البناء الحديثة');
    await page.getByLabel('الوجهة').fill('أبوظبي - خورفكان');
    await page.getByLabel('قيمة الإيراد *').fill('15000');
    try { await page.getByLabel('ملاحظات').fill('رحلة تجريبية للسكرين شوت'); } catch (e) {}
    await page.waitForTimeout(300);
    await shot(page, 'revenues-add-filled');

    await page.getByRole('button', { name: 'إضافة الإيراد' }).click();
    await page.waitForTimeout(2500);
    await w(page);
    await shot(page, 'revenues-after-add');
  } else {
    console.log('  (revenue form skipped - button disabled?)');
  }

  // ═══ EXPENSES ═══
  await go(page, '/expenses');
  await w(page, 1500);
  await shot(page, 'expenses-list');

  if (await openDialog(page, 'إضافة مصروف')) {
    await selectFirstOption(page);
    await page.getByLabel('قيمة المصروف *').fill('3500');
    try { await page.getByLabel('الوصف').fill('صيانة دورية - تجربة السكرين شوت'); } catch (e) {}
    await page.waitForTimeout(300);
    await shot(page, 'expenses-add-filled');

    await page.getByRole('button', { name: 'إضافة المصروف' }).click();
    await page.waitForTimeout(2500);
    await w(page);
    await shot(page, 'expenses-after-add');
  } else {
    console.log('  (expense form skipped)');
  }

  // ═══ PAYROLL ═══
  await go(page, '/payroll');
  await w(page, 1500);
  await shot(page, 'payroll-list');

  if (await openDialog(page, 'تسجيل راتب')) {
    await selectFirstOption(page);
    await page.waitForTimeout(500);
    try { await page.getByLabel(/الخصومات/).fill('500'); } catch (e) {}
    try { await page.getByLabel(/السلف/).fill('1000'); } catch (e) {}
    try { await page.getByLabel('ملاحظات').fill('راتب تجريبي للسكرين شوت'); } catch (e) {}
    await page.waitForTimeout(300);
    await shot(page, 'payroll-add-filled');

    await page.getByRole('button', { name: 'حفظ' }).click();
    await page.waitForTimeout(2500);
    await w(page);
    await shot(page, 'payroll-after-add');
  } else {
    console.log('  (payroll form skipped)');
  }

  // ═══ REPORTS ═══
  await go(page, '/reports');
  await w(page);
  await shot(page, 'reports-income');
  await shot(page, 'reports-print-preview');

  try {
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }),
      page.getByRole('button', { name: 'تصدير PDF' }).click(),
    ]);
    await download.saveAs(path.join(DIR, 'downloaded-income-statement.pdf'));
    console.log('  [PDF] downloaded');
  } catch (e) { console.log('  (PDF skipped)'); }
  await page.waitForTimeout(1000);
  await shot(page, 'reports-pdf-downloaded');

  // ═══ SETTINGS ═══
  await go(page, '/settings');
  await w(page);
  await shot(page, 'settings-company');

  try {
    await page.getByText('الملف الشخصي').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
  } catch (e) {}
  await shot(page, 'settings-profile');

  // ═══ ACTIVITY ═══
  await go(page, '/activity');
  await w(page);
  await shot(page, 'activity-log');

  // ═══ SEARCH ═══
  await go(page, '/search?q=فولفو');
  await w(page);
  await shot(page, 'search-results');

  console.log(`\nDone! ${idx} screenshots saved to screenshots/`);
  await browser.close();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
