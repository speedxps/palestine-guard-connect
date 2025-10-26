import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Printer, Download, X } from 'lucide-react';

interface PrintableGuideProps {
  sections: any[];
}

export const PrintableGuide: React.FC<PrintableGuideProps> = ({ sections }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedSection = searchParams.get('section');

  const sectionsToShow = selectedSection
    ? sections.filter(s => s.title === selectedSection)
    : sections;

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap');
        
        body {
          font-family: 'Noto Sans Arabic', Arial, sans-serif;
          direction: rtl;
          background: white;
          margin: 0;
          padding: 0;
        }

        .print-container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 20mm;
          background: white;
        }

        .no-print {
          position: fixed;
          top: 20px;
          left: 20px;
          right: 20px;
          display: flex;
          gap: 10px;
          justify-content: center;
          z-index: 1000;
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        @media print {
          .no-print {
            display: none !important;
          }

          .print-container {
            max-width: 100%;
            padding: 15mm;
          }

          .page-break {
            page-break-before: always;
          }

          body {
            margin: 0;
            padding: 0;
          }
        }

        .guide-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 4px solid #2980b9;
        }

        .guide-title {
          color: #2980b9;
          font-size: 36px;
          font-weight: 700;
          margin: 0 0 10px 0;
          line-height: 1.4;
        }

        .guide-subtitle {
          color: #34495e;
          font-size: 20px;
          font-weight: 600;
          margin: 10px 0;
        }

        .guide-date {
          color: #7f8c8d;
          font-size: 14px;
          margin-top: 15px;
        }

        .guide-intro {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 30px;
          text-align: center;
          font-size: 16px;
          line-height: 1.8;
        }

        .section {
          margin: 40px 0;
          page-break-inside: avoid;
        }

        .section-title {
          color: #2980b9;
          font-size: 28px;
          font-weight: 700;
          margin: 30px 0 20px 0;
          padding-right: 20px;
          border-right: 6px solid #2980b9;
          line-height: 1.4;
        }

        .item {
          margin: 25px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
          border-right: 4px solid #3498db;
          page-break-inside: avoid;
        }

        .item-number {
          display: inline-block;
          background: #2980b9;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          text-align: center;
          line-height: 32px;
          font-weight: 700;
          margin-left: 12px;
          font-size: 16px;
        }

        .item-title {
          font-size: 20px;
          font-weight: 600;
          color: #2c3e50;
          margin: 15px 0;
          display: inline;
        }

        .item-content {
          font-size: 15px;
          color: #34495e;
          line-height: 1.9;
          margin-top: 12px;
        }

        .item-content p {
          margin: 10px 0;
        }

        .item-content ul, .item-content ol {
          margin: 12px 0;
          padding-right: 30px;
        }

        .item-content li {
          margin: 8px 0;
          line-height: 1.8;
        }

        .guide-footer {
          margin-top: 50px;
          padding-top: 25px;
          border-top: 3px solid #bdc3c7;
          text-align: center;
          color: #7f8c8d;
          page-break-inside: avoid;
        }

        .footer-logo {
          font-size: 24px;
          font-weight: 700;
          color: #2980b9;
          margin-bottom: 10px;
        }

        .footer-text {
          font-size: 14px;
          line-height: 1.6;
        }

        @page {
          size: A4;
          margin: 15mm;
        }
      `}</style>

      <div className="no-print">
        <Button onClick={handlePrint} size="lg" className="gap-2">
          <Printer className="h-5 w-5" />
          طباعة الدليل
        </Button>
        <Button onClick={handlePrint} variant="outline" size="lg" className="gap-2">
          <Download className="h-5 w-5" />
          حفظ كـ PDF
        </Button>
        <Button onClick={handleClose} variant="ghost" size="lg">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="print-container">
        <div className="guide-header">
          <h1 className="guide-title">دليل مستخدم نظام PoliceOps</h1>
          <h2 className="guide-subtitle">الشرطة الفلسطينية</h2>
          <p className="guide-date">
            تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="guide-intro">
          <p>
            مرحباً بك في دليل مستخدم نظام PoliceOps الشامل. هذا الدليل يحتوي على كافة المعلومات
            والإرشادات اللازمة لاستخدام النظام بكفاءة عالية. تم تصميم هذا الدليل ليكون مرجعاً
            سهلاً وواضحاً لجميع مستخدمي النظام.
          </p>
        </div>

        {sectionsToShow.map((section, sectionIndex) => (
          <div key={sectionIndex} className={sectionIndex > 0 ? 'section page-break' : 'section'}>
            <h2 className="section-title">{section.title}</h2>
            
            {section.items.map((item: any, itemIndex: number) => (
              <div key={itemIndex} className="item">
                <div>
                  <span className="item-number">{itemIndex + 1}</span>
                  <h3 className="item-title">{item.title}</h3>
                </div>
                <div className="item-content">
                  {renderContent(item.content)}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className="guide-footer">
          <div className="footer-logo">PoliceOps</div>
          <div className="footer-text">
            <p>نظام العمليات الشرطية المتكامل</p>
            <p>الشرطة الفلسطينية - جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
            <p>للدعم والمساعدة: يرجى التواصل مع قسم الدعم الفني</p>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper function to render React content as readable text
const renderContent = (content: any): React.ReactNode => {
  if (!content) return null;
  
  // If content is a React element, try to extract text from it
  if (React.isValidElement(content)) {
    return extractTextFromReactElement(content);
  }
  
  return <p>معلومات تفصيلية عن الموضوع متوفرة في النظام.</p>;
};

const extractTextFromReactElement = (element: React.ReactElement): React.ReactNode => {
  const props = element.props;
  
  // If it has children, process them
  if (props.children) {
    if (typeof props.children === 'string') {
      return <p>{props.children}</p>;
    }
    
    if (Array.isArray(props.children)) {
      return props.children.map((child: any, index: number) => {
        if (typeof child === 'string') {
          return <p key={index}>{child}</p>;
        }
        if (React.isValidElement(child)) {
          return <div key={index}>{extractTextFromReactElement(child)}</div>;
        }
        return null;
      });
    }
    
    if (React.isValidElement(props.children)) {
      return extractTextFromReactElement(props.children);
    }
  }
  
  return null;
};