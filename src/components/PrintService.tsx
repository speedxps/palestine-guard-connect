import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PrintServiceProps {
  title: string;
  content: React.ReactNode | string;
  pageTitle?: string;
  department?: string;
  documentType?: string;
  includeSignature?: boolean;
  className?: string;
}

export const PrintService: React.FC<PrintServiceProps> = ({
  title,
  content,
  pageTitle = 'وثيقة رسمية',
  department = 'الشرطة الفلسطينية',
  documentType = 'تقرير',
  includeSignature = true,
  className = ''
}) => {
  const { user } = useAuth();

  const generatePrintContent = () => {
    const currentDate = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const currentTime = new Date().toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${pageTitle} - ${department}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Noto Sans Arabic', Arial, sans-serif;
            direction: rtl;
            background: white;
            color: #000;
            line-height: 1.6;
            font-size: 14px;
          }
          
          .print-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
            min-height: 297mm;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .logo-section {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin-bottom: 15px;
          }
          
          .logo {
            width: 80px;
            height: 80px;
            border: 2px solid #1e40af;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
          }
          
          .header-text h1 {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
          }
          
          .header-text h2 {
            font-size: 18px;
            color: #64748b;
            font-weight: normal;
          }
          
          .document-info {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-right: 4px solid #1e40af;
          }
          
          .document-info h3 {
            font-size: 18px;
            color: #1e40af;
            margin-bottom: 10px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          
          .info-item {
            display: flex;
            justify-content: space-between;
          }
          
          .info-label {
            font-weight: bold;
            color: #374151;
          }
          
          .info-value {
            color: #6b7280;
          }
          
          .content {
            background: white;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 30px;
            min-height: 400px;
          }
          
          .content h4 {
            font-size: 16px;
            color: #1e40af;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          
          .signature-section {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          
          .signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 30px;
          }
          
          .signature-box {
            text-align: center;
            padding: 20px;
            border: 1px dashed #9ca3af;
            border-radius: 8px;
          }
          
          .signature-label {
            font-weight: bold;
            color: #374151;
            margin-bottom: 40px;
          }
          
          .signature-line {
            width: 200px;
            height: 1px;
            background: #9ca3af;
            margin: 20px auto;
          }
          
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          
          @media print {
            body { print-color-adjust: exact; }
            .print-container { box-shadow: none; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <!-- Header -->
          <div class="header">
            <div class="logo-section">
              <div class="logo">
                <img src="/lovable-uploads/5d8c7245-166d-4337-afbb-639857489274.png" 
                     alt="Palestinian Police Logo" 
                     style="width: 60px; height: 60px; object-fit: contain;" />
              </div>
              <div class="header-text">
                <h1>الشرطة الفلسطينية</h1>
                <h2>Palestinian Police Department</h2>
              </div>
            </div>
          </div>
          
          <!-- Document Info -->
          <div class="document-info">
            <h3>${documentType}</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">العنوان:</span>
                <span class="info-value">${title}</span>
              </div>
              <div class="info-item">
                <span class="info-label">التاريخ:</span>
                <span class="info-value">${currentDate}</span>
              </div>
              <div class="info-item">
                <span class="info-label">الوقت:</span>
                <span class="info-value">${currentTime}</span>
              </div>
              <div class="info-item">
                <span class="info-label">القسم:</span>
                <span class="info-value">${department}</span>
              </div>
              <div class="info-item">
                <span class="info-label">المُعد:</span>
                <span class="info-value">${user?.full_name || 'غير محدد'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">رقم الوثيقة:</span>
                <span class="info-value">PS-${Date.now().toString().slice(-6)}</span>
              </div>
            </div>
          </div>
          
          <!-- Content -->
          <div class="content">
            <h4>المحتوى:</h4>
            ${typeof content === 'string' ? content : ''}
          </div>
          
          ${includeSignature ? `
          <!-- Signature Section -->
          <div class="signature-section">
            <div class="signature-grid">
              <div class="signature-box">
                <div class="signature-label">توقيع المُعد</div>
                <div class="signature-line"></div>
                <div style="margin-top: 10px; font-size: 12px;">${user?.full_name || 'غير محدد'}</div>
              </div>
              <div class="signature-box">
                <div class="signature-label">توقيع المسؤول</div>
                <div class="signature-line"></div>
                <div style="margin-top: 10px; font-size: 12px;">المدير المختص</div>
              </div>
            </div>
          </div>
          ` : ''}
          
          <!-- Footer -->
          <div class="footer">
            <p>هذه وثيقة رسمية صادرة عن الشرطة الفلسطينية</p>
            <p>Palestinian Police Department - Official Document</p>
            <p>تم الإنتاج بتاريخ: ${currentDate} - ${currentTime}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrint = () => {
    if (!content || (typeof content === 'string' && content.trim() === '')) {
      alert('لا توجد بيانات للطباعة. تأكد من وجود محتوى في التقرير.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = generatePrintContent();
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for images and content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 1000);
      };
      
      // Fallback timeout
      setTimeout(() => {
        printWindow.print();
      }, 1500);
    } else {
      alert('فشل في فتح نافذة الطباعة. تأكد من السماح بالنوافذ المنبثقة.');
    }
  };

  return (
    <Button
      onClick={handlePrint}
      variant="outline"
      className={`flex items-center gap-2 font-arabic bg-white border-primary/20 hover:bg-primary/5 text-foreground ${className}`}
    >
      <Printer className="h-4 w-4" />
      طباعة التقرير
    </Button>
  );
};

export default PrintService;