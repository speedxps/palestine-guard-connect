import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  type: 'citizen' | 'vehicle' | 'incident' | 'patrol' | 'cybercrime_case' | 'judicial_case';
  title: string;
  subtitle: string;
  description?: string;
  metadata: Record<string, any>;
  created_at?: string;
}

export interface SearchResults {
  citizens: SearchResult[];
  vehicles: SearchResult[];
  incidents: SearchResult[];
  patrols: SearchResult[];
  cybercrimeCases: SearchResult[];
  judicialCases: SearchResult[];
  total: number;
}

export const useUniversalSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    citizens: [],
    vehicles: [],
    incidents: [],
    patrols: [],
    cybercrimeCases: [],
    judicialCases: [],
    total: 0
  });

  const search = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults({
        citizens: [],
        vehicles: [],
        incidents: [],
        patrols: [],
        cybercrimeCases: [],
        judicialCases: [],
        total: 0
      });
      return;
    }

    setLoading(true);
    const trimmedTerm = searchTerm.trim();

    try {
      // البحث بالتوازي في جميع الجداول
      const [
        citizensData,
        vehiclesData,
        incidentsData,
        patrolsData,
        cybercrimeCasesData,
        judicialCasesData
      ] = await Promise.all([
        // البحث في المواطنين
        supabase
          .from('citizens')
          .select('*')
          .or(`national_id.ilike.%${trimmedTerm}%,full_name.ilike.%${trimmedTerm}%,phone.ilike.%${trimmedTerm}%,first_name.ilike.%${trimmedTerm}%,father_name.ilike.%${trimmedTerm}%`)
          .limit(20),

        // البحث في المركبات
        supabase
          .from('vehicle_registrations')
          .select(`
            *,
            vehicle_owners(*)
          `)
          .or(`plate_number.ilike.%${trimmedTerm}%,engine_number.ilike.%${trimmedTerm}%,chassis_number.ilike.%${trimmedTerm}%`)
          .limit(20),

        // البحث في البلاغات
        supabase
          .from('incidents')
          .select('*')
          .or(`title.ilike.%${trimmedTerm}%,description.ilike.%${trimmedTerm}%,incident_type.ilike.%${trimmedTerm}%,location_address.ilike.%${trimmedTerm}%`)
          .order('created_at', { ascending: false })
          .limit(20),

        // البحث في الدوريات
        supabase
          .from('patrols')
          .select('*')
          .or(`name.ilike.%${trimmedTerm}%,area.ilike.%${trimmedTerm}%`)
          .limit(20),

        // البحث في قضايا الجرائم الإلكترونية
        supabase
          .from('cybercrime_cases')
          .select('*')
          .or(`case_number.ilike.%${trimmedTerm}%,title.ilike.%${trimmedTerm}%,case_type.ilike.%${trimmedTerm}%,national_id.ilike.%${trimmedTerm}%`)
          .order('created_at', { ascending: false })
          .limit(20),

        // البحث في القضايا القضائية
        supabase
          .from('judicial_cases')
          .select('*')
          .or(`case_number.ilike.%${trimmedTerm}%,title.ilike.%${trimmedTerm}%,case_type.ilike.%${trimmedTerm}%,national_id.ilike.%${trimmedTerm}%`)
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      // تحويل النتائج إلى صيغة موحدة
      const citizens: SearchResult[] = (citizensData.data || []).map(c => ({
        id: c.id,
        type: 'citizen' as const,
        title: c.full_name || `${c.first_name || ''} ${c.father_name || ''}`.trim(),
        subtitle: `رقم الهوية: ${c.national_id}`,
        description: c.phone || c.address,
        metadata: c,
        created_at: c.created_at
      }));

      const vehicles: SearchResult[] = (vehiclesData.data || []).map(v => ({
        id: v.id,
        type: 'vehicle' as const,
        title: `${v.model || 'مركبة'} - ${v.plate_number}`,
        subtitle: `رقم اللوحة: ${v.plate_number}`,
        description: v.color ? `اللون: ${v.color}` : undefined,
        metadata: v,
        created_at: v.created_at
      }));

      const incidents: SearchResult[] = (incidentsData.data || []).map(i => ({
        id: i.id,
        type: 'incident' as const,
        title: i.title,
        subtitle: `نوع البلاغ: ${i.incident_type}`,
        description: i.location_address,
        metadata: i,
        created_at: i.created_at
      }));

      const patrols: SearchResult[] = (patrolsData.data || []).map(p => ({
        id: p.id,
        type: 'patrol' as const,
        title: p.name || 'دورية',
        subtitle: `المنطقة: ${p.area || 'غير محدد'}`,
        description: p.status || undefined,
        metadata: p,
        created_at: p.created_at
      }));

      const cybercrimeCases: SearchResult[] = (cybercrimeCasesData.data || []).map(c => ({
        id: c.id,
        type: 'cybercrime_case' as const,
        title: c.title,
        subtitle: `رقم القضية: ${c.case_number}`,
        description: `نوع الجريمة: ${c.case_type}`,
        metadata: c,
        created_at: c.created_at
      }));

      const judicialCases: SearchResult[] = (judicialCasesData.data || []).map(c => ({
        id: c.id,
        type: 'judicial_case' as const,
        title: c.title,
        subtitle: `رقم القضية: ${c.case_number}`,
        description: `نوع القضية: ${c.case_type}`,
        metadata: c,
        created_at: c.created_at
      }));

      const total = citizens.length + vehicles.length + incidents.length + 
                    patrols.length + cybercrimeCases.length + judicialCases.length;

      setResults({
        citizens,
        vehicles,
        incidents,
        patrols,
        cybercrimeCases,
        judicialCases,
        total
      });
    } catch (error) {
      console.error('خطأ في البحث:', error);
      setResults({
        citizens: [],
        vehicles: [],
        incidents: [],
        patrols: [],
        cybercrimeCases: [],
        judicialCases: [],
        total: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    search,
    loading,
    results
  };
};
