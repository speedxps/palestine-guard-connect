import jsPDF from 'jspdf';
import { configureArabicPDF, addArabicText } from './arabicPdfConfig';

interface Section {
  title: string;
  items: {
    title: string;
    content: any;
  }[];
}

export const exportGuideToPDF = (sections: Section[], selectedSection?: string) => {
  const doc = new jsPDF();
  configureArabicPDF(doc);

  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const maxWidth = doc.internal.pageSize.width - 2 * margin;

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  addArabicText(doc, 'دليل مستخدم نظام PoliceOps', margin, yPosition, { align: 'right', maxWidth });
  yPosition += 15;

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const currentDate = new Date().toLocaleDateString('ar-EG');
  addArabicText(doc, `تاريخ الإنشاء: ${currentDate}`, margin, yPosition, { align: 'right', maxWidth });
  yPosition += 20;

  // Filter sections if specific section is selected
  const sectionsToExport = selectedSection
    ? sections.filter(s => s.title === selectedSection)
    : sections;

  // Iterate through sections
  sectionsToExport.forEach((section, sectionIndex) => {
    checkNewPage(30);

    // Section title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185); // Blue color
    addArabicText(doc, section.title, margin, yPosition, { align: 'right', maxWidth });
    yPosition += 12;

    // Section items
    section.items.forEach((item, itemIndex) => {
      checkNewPage(25);

      // Item title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      addArabicText(doc, `${itemIndex + 1}. ${item.title}`, margin + 5, yPosition, { align: 'right', maxWidth: maxWidth - 5 });
      yPosition += 10;

      // Note: Content rendering is simplified
      // In a real implementation, you would parse the React content and convert to text
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      
      // Add placeholder for content (you would need to extract actual text from React components)
      const contentText = `محتوى موضوع: ${item.title}`;
      const lines = doc.splitTextToSize(contentText, maxWidth - 10);
      
      lines.forEach((line: string) => {
        checkNewPage(7);
        addArabicText(doc, line, margin + 10, yPosition, { align: 'right', maxWidth: maxWidth - 10 });
        yPosition += 7;
      });

      yPosition += 8;
    });

    yPosition += 10;

    // Add separator line between sections
    if (sectionIndex < sectionsToExport.length - 1) {
      checkNewPage(5);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, doc.internal.pageSize.width - margin, yPosition);
      yPosition += 15;
    }
  });

  // Footer on each page
  const totalPages = doc.internal.pages.length - 1; // -1 because first element is null
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.setFont('helvetica', 'normal');
    addArabicText(
      doc,
      `صفحة ${i} من ${totalPages}`,
      doc.internal.pageSize.width / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = selectedSection
    ? `دليل_المستخدم_${selectedSection}.pdf`
    : 'دليل_المستخدم_كامل.pdf';
  
  doc.save(filename);
};
