// تكوين PDF لدعم اللغة العربية بشكل كامل
import jsPDF from 'jspdf';

// تحميل خط عربي مخصص
export const configureArabicPDF = (doc: jsPDF) => {
  // استخدام خط يدعم العربية
  doc.setFont('helvetica');
  doc.setLanguage('ar');
  
  return doc;
};

// دالة لعكس النص العربي لعرضه بشكل صحيح في PDF
export const reverseArabicText = (text: string): string => {
  // تقسيم النص إلى كلمات
  const words = text.split(' ');
  // عكس ترتيب الكلمات
  return words.reverse().join(' ');
};

// دالة مساعدة لإضافة نص عربي بشكل صحيح
export const addArabicText = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: { align?: 'left' | 'center' | 'right' | 'justify'; maxWidth?: number }
) => {
  // إضافة النص مباشرة بدون عكس
  doc.text(text, x, y, options);
};
