import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  title: string;
  subtitle?: string;
  date: string;
  generatedBy: string;
  sections: ReportSection[];
}

interface ReportSection {
  title: string;
  type: 'table' | 'text' | 'stats';
  data: any;
}

export class PDFReportService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  async generateReport(reportData: ReportData): Promise<Blob> {
    // Add header with police logo
    await this.addHeader();
    
    // Add title
    this.addTitle(reportData.title, reportData.subtitle);
    
    // Add metadata
    this.addMetadata(reportData.date, reportData.generatedBy);
    
    // Add sections
    let yPosition = 80;
    for (const section of reportData.sections) {
      yPosition = this.addSection(section, yPosition);
    }
    
    // Add footer
    this.addFooter();
    
    return this.doc.output('blob');
  }

  private async addHeader() {
    // Add police logo
    try {
      const logoUrl = '/src/assets/police-logo.png';
      const img = await this.loadImage(logoUrl);
      this.doc.addImage(img, 'PNG', this.margin, 10, 30, 30);
    } catch (error) {
      console.error('Failed to load logo:', error);
    }

    // Add header text
    this.doc.setFontSize(20);
    this.doc.setTextColor(0, 51, 102);
    this.doc.text('Palestine Guard Connect', this.pageWidth / 2, 20, { align: 'center' });
    
    this.doc.setFontSize(12);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('نظام إدارة الشرطة الفلسطينية', this.pageWidth / 2, 28, { align: 'center' });
    
    // Add line
    this.doc.setDrawColor(0, 51, 102);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, 45, this.pageWidth - this.margin, 45);
  }

  private addTitle(title: string, subtitle?: string) {
    this.doc.setFontSize(18);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, this.pageWidth / 2, 55, { align: 'center' });
    
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(subtitle, this.pageWidth / 2, 62, { align: 'center' });
    }
  }

  private addMetadata(date: string, generatedBy: string) {
    this.doc.setFontSize(10);
    this.doc.setTextColor(80, 80, 80);
    this.doc.text(`التاريخ: ${date}`, this.margin, 70);
    this.doc.text(`تم الإنشاء بواسطة: ${generatedBy}`, this.pageWidth - this.margin, 70, { align: 'right' });
  }

  private addSection(section: ReportSection, yPosition: number): number {
    // Check if we need a new page
    if (yPosition > this.pageHeight - 40) {
      this.doc.addPage();
      yPosition = 20;
    }

    // Add section title
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 51, 102);
    this.doc.text(section.title, this.margin, yPosition);
    yPosition += 8;

    // Add section content based on type
    if (section.type === 'table') {
      yPosition = this.addTable(section.data, yPosition);
    } else if (section.type === 'text') {
      yPosition = this.addText(section.data, yPosition);
    } else if (section.type === 'stats') {
      yPosition = this.addStats(section.data, yPosition);
    }

    return yPosition + 10;
  }

  private addTable(data: any[], yPosition: number): number {
    if (!data || data.length === 0) return yPosition;

    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(key => row[key]));

    autoTable(this.doc, {
      startY: yPosition,
      head: [headers],
      body: rows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    return (this.doc as any).lastAutoTable.finalY + 5;
  }

  private addText(text: string, yPosition: number): number {
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin);
    this.doc.text(lines, this.margin, yPosition);
    return yPosition + lines.length * 5;
  }

  private addStats(stats: any, yPosition: number): number {
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    
    const keys = Object.keys(stats);
    keys.forEach((key, index) => {
      const value = stats[key];
      this.doc.text(`${key}: ${value}`, this.margin, yPosition + index * 7);
    });

    return yPosition + keys.length * 7;
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(150, 150, 150);
      this.doc.text(
        `صفحة ${i} من ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
      this.doc.text(
        `تم الإنشاء بواسطة Palestine Guard Connect`,
        this.pageWidth / 2,
        this.pageHeight - 5,
        { align: 'center' }
      );
    }
  }

  private loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  downloadReport(filename: string) {
    this.doc.save(filename);
  }
}

// Export function to generate monthly report
export async function generateMonthlyReport(month: string, year: string, data: any) {
  const service = new PDFReportService();
  
  const reportData: ReportData = {
    title: `التقرير الشهري - ${month}/${year}`,
    subtitle: 'تقرير شامل للأنشطة والإحصائيات',
    date: new Date().toLocaleDateString('ar-PS'),
    generatedBy: 'النظام الآلي',
    sections: [
      {
        title: 'إحصائيات عامة',
        type: 'stats',
        data: {
          'إجمالي الحوادث': data.totalIncidents || 0,
          'إجمالي الدوريات': data.totalPatrols || 0,
          'إجمالي المهام': data.totalTasks || 0,
          'المخالفات المرورية': data.totalViolations || 0,
        }
      },
      {
        title: 'تفاصيل الحوادث',
        type: 'table',
        data: data.incidents || []
      },
      {
        title: 'الدوريات النشطة',
        type: 'table',
        data: data.patrols || []
      }
    ]
  };

  return await service.generateReport(reportData);
}
