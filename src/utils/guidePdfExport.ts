import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Section {
  title: string;
  items: {
    title: string;
    content: any;
  }[];
}

// Helper function to create HTML content for PDF
const createPrintableHTML = (sections: Section[], selectedSection?: string): string => {
  const sectionsToExport = selectedSection
    ? sections.filter(s => s.title === selectedSection)
    : sections;

  const currentDate = new Date().toLocaleDateString('ar-EG');

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap');
        
        body {
          font-family: 'Noto Sans Arabic', Arial, sans-serif;
          direction: rtl;
          padding: 40px;
          background: white;
          color: #000;
          line-height: 1.8;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #2980b9;
          padding-bottom: 20px;
        }
        
        .header h1 {
          color: #2980b9;
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 10px 0;
        }
        
        .header .date {
          color: #666;
          font-size: 14px;
        }
        
        .section {
          margin: 30px 0;
          page-break-inside: avoid;
        }
        
        .section-title {
          color: #2980b9;
          font-size: 24px;
          font-weight: 700;
          margin: 20px 0 15px 0;
          border-right: 5px solid #2980b9;
          padding-right: 15px;
        }
        
        .item {
          margin: 20px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          page-break-inside: avoid;
        }
        
        .item-title {
          font-size: 18px;
          font-weight: 600;
          color: #000;
          margin-bottom: 10px;
        }
        
        .item-content {
          font-size: 14px;
          color: #333;
          line-height: 1.8;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #ddd;
          color: #666;
          font-size: 12px;
        }
        
        ol, ul {
          margin: 10px 0;
          padding-right: 25px;
        }
        
        li {
          margin: 8px 0;
        }
        
        @media print {
          body {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>دليل مستخدم نظام PoliceOps</h1>
        <div class="date">تاريخ الإنشاء: ${currentDate}</div>
      </div>
      
      ${sectionsToExport.map(section => `
        <div class="section">
          <h2 class="section-title">${section.title}</h2>
          ${section.items.map((item, index) => `
            <div class="item">
              <h3 class="item-title">${index + 1}. ${item.title}</h3>
              <div class="item-content">
                <p>موضوع: ${item.title}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
      
      <div class="footer">
        <p>نظام PoliceOps - الشرطة الفلسطينية</p>
        <p>${currentDate}</p>
      </div>
    </body>
    </html>
  `;
};

export const exportGuideToPDF = async (sections: Section[], selectedSection?: string) => {
  // Create temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '210mm'; // A4 width
  container.innerHTML = createPrintableHTML(sections, selectedSection);
  document.body.appendChild(container);

  // Wait for fonts to load
  await document.fonts.ready;

  // Generate PDF
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;
  
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  // Clean up
  document.body.removeChild(container);

  const filename = selectedSection
    ? `دليل_المستخدم_${selectedSection}.pdf`
    : 'دليل_المستخدم_كامل.pdf';

  return { doc: pdf, filename };
};

export const downloadGuidePDF = async (sections: Section[], selectedSection?: string) => {
  const { doc, filename } = await exportGuideToPDF(sections, selectedSection);
  doc.save(filename);
};

export const printGuidePDF = async (sections: Section[], selectedSection?: string) => {
  const { doc } = await exportGuideToPDF(sections, selectedSection);
  
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  const printWindow = window.open(pdfUrl, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 1000);
    };
  }
};
