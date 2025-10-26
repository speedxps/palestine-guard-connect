import jsPDF from 'jspdf';

interface Section {
  title: string;
  items: {
    title: string;
    content: any;
  }[];
}

// Simple PDF export using basic text rendering
const createSimplePDF = (sections: Section[], selectedSection?: string) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const sectionsToExport = selectedSection
    ? sections.filter(s => s.title === selectedSection)
    : sections;

  let yPos = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;

  // Add title
  doc.setFontSize(20);
  doc.text('Police Ops User Guide', margin, yPos);
  yPos += 10;
  
  doc.setFontSize(12);
  doc.text(new Date().toLocaleDateString('en-US'), margin, yPos);
  yPos += 15;

  // Add sections
  sectionsToExport.forEach((section) => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.text(section.title, margin, yPos);
    yPos += 10;

    section.items.forEach((item, idx) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.text(`${idx + 1}. ${item.title}`, margin + 5, yPos);
      yPos += 8;
    });

    yPos += 5;
  });

  const filename = selectedSection
    ? `user_guide_${selectedSection}.pdf`
    : 'user_guide_complete.pdf';

  return { doc, filename };
};

export const downloadGuidePDF = (sections: Section[], selectedSection?: string) => {
  const { doc, filename } = createSimplePDF(sections, selectedSection);
  doc.save(filename);
};

export const printGuidePDF = (sections: Section[], selectedSection?: string) => {
  const { doc } = createSimplePDF(sections, selectedSection);
  
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  const printWindow = window.open(pdfUrl, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    };
  }
};
