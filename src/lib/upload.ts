// تخزين ملفات المستخدم (صور الإيصالات والشعار) كـ Base64 داخل قاعدة البيانات نفسها
// (data URL)، لا على قرص الخادم. هذا يضمن عمل النظام دون فرق بين البيئة المحلية
// وبيئة Render، لأن المسار على القرص يختلف بين الجهاز والخادم بينما قاعدة البيانات واحدة.
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

// تحويل ملف الصورة إلى data URL (Base64) وتخزينه مباشرة في الحقل النصي بالسجل.
export async function saveReceipt(file: File): Promise<string> {
  if (!file || typeof file === "string" || file.size === 0) {
    throw new Error("الملف فارغ");
  }
  if (!ALLOWED.includes(file.type)) {
    throw new Error("نوع الملف غير مدعوم (يسمح فقط بصور JPEG/PNG/WEBP/GIF)");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("حجم الصورة يتجاوز الحد المسموح (5 ميجابايت)");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const base64 = buf.toString("base64");
  return `data:${file.type};base64,${base64}`;
}

// الصور مخزَّنة كـ Base64 داخل قاعدة البيانات، فلا حاجة لحذف ملف من قرص الخادم.
export async function removeReceipt(_relativePath: string | null | undefined): Promise<void> {
  return;
}
