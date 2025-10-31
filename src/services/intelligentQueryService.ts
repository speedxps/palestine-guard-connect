import { supabase } from '@/integrations/supabase/client';

export interface QueryResponse {
  query: string;
  type: string;
  timestamp: string;
  title: string;
  summary: string;
  data: any;
}

export const intelligentQueryService = {
  async sendQuery(query: string): Promise<QueryResponse> {
    const { data, error } = await supabase.functions.invoke('intelligent-query', {
      body: { query }
    });

    if (error) throw error;
    return data;
  },

  async downloadReportAsPDF(reportData: QueryResponse): Promise<void> {
    // This will be implemented with jsPDF
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set RTL and Arabic font
    doc.setR2L(true);
    doc.setLanguage('ar');

    // Title
    doc.setFontSize(20);
    doc.text(reportData.title, 105, 20, { align: 'center' });

    // Summary
    doc.setFontSize(12);
    const summaryLines = doc.splitTextToSize(reportData.summary, 170);
    doc.text(summaryLines, 105, 40, { align: 'center' });

    // Data sections
    let yPos = 60;
    
    if (reportData.data.citizen) {
      doc.setFontSize(14);
      doc.text('بيانات المواطن', 105, yPos, { align: 'center' });
      yPos += 10;
      
      const citizen = reportData.data.citizen;
      doc.setFontSize(10);
      doc.text(`الاسم: ${citizen.full_name || '-'}`, 20, yPos);
      yPos += 7;
      doc.text(`رقم الهوية: ${citizen.national_id || '-'}`, 20, yPos);
      yPos += 7;
      doc.text(`الهاتف: ${citizen.phone || '-'}`, 20, yPos);
      yPos += 10;
    }

    // Save
    doc.save(`تقرير-${Date.now()}.pdf`);
  },

  copyReportToClipboard(reportData: QueryResponse): void {
    const text = `${reportData.summary}`;
    navigator.clipboard.writeText(text);
  }
};
