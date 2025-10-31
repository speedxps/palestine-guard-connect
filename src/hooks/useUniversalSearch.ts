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
  // معلومات إضافية للمواطنين
  national_id?: string;
  summary?: {
    vehicles_count?: number;
    violations_count?: number;
    cybercrime_cases?: number;
    judicial_cases?: number;
    incidents?: number;
    notifications?: number;
    properties_count?: number;
    is_wanted?: boolean;
    family_members?: number;
  };
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
      // البحث الدقيق أولاً، ثم البحث المتشابه
      const [
        citizensData,
        vehiclesData,
        incidentsData,
        patrolsData,
        cybercrimeCasesData,
        judicialCasesData
      ] = await Promise.all([
        // البحث في المواطنين - بحث دقيق أولاً
        supabase
          .from('citizens')
          .select('*')
          .or(`national_id.eq.${trimmedTerm},full_name.eq.${trimmedTerm},phone.eq.${trimmedTerm}`)
          .limit(20)
          .then(async (exactResult) => {
            // إذا لم نجد نتائج دقيقة، نبحث بالتشابه
            if (!exactResult.data || exactResult.data.length === 0) {
              return supabase
                .from('citizens')
                .select('*')
                .or(`national_id.ilike.%${trimmedTerm}%,full_name.ilike.%${trimmedTerm}%,phone.ilike.%${trimmedTerm}%`)
                .limit(20);
            }
            return exactResult;
          }),

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

      // تحويل النتائج إلى صيغة موحدة مع إضافة ملخص للمواطنين
      const citizensWithSummary = await Promise.all(
        (citizensData.data || []).map(async (c) => {
          // جلب إحصائيات سريعة للمواطن
          const [vehiclesCount, violationsCount, cyberCasesCount, judicialCasesCount, incidentsCount, notificationsCount, propertiesCount, isWanted] = await Promise.all([
            supabase.from('vehicle_owners').select('id', { count: 'exact', head: true }).eq('national_id', c.national_id).then(r => r.count || 0),
            supabase.from('traffic_records').select('id', { count: 'exact', head: true }).eq('national_id', c.national_id).then(r => r.count || 0),
            supabase.from('cybercrime_cases').select('id', { count: 'exact', head: true }).eq('national_id', c.national_id).then(r => r.count || 0),
            supabase.from('judicial_cases').select('id', { count: 'exact', head: true }).eq('national_id', c.national_id).then(r => r.count || 0),
            supabase.from('incidents').select('id', { count: 'exact', head: true }).eq('reporter_national_id', c.national_id).then(r => r.count || 0),
            supabase.from('official_notifications').select('id', { count: 'exact', head: true }).eq('recipient_national_id', c.national_id).then(r => r.count || 0),
            supabase.from('citizen_properties').select('id', { count: 'exact', head: true }).eq('citizen_id', c.id).then(r => r.count || 0),
            supabase.from('wanted_persons').select('id').eq('citizen_id', c.id).maybeSingle().then(r => !!r.data)
          ]);

          return {
            id: c.id,
            type: 'citizen' as const,
            title: c.full_name || `${c.first_name || ''} ${c.father_name || ''}`.trim(),
            subtitle: `رقم الهوية: ${c.national_id}`,
            description: c.phone || c.address,
            metadata: c,
            created_at: c.created_at,
            national_id: c.national_id,
            summary: {
              vehicles_count: vehiclesCount,
              violations_count: violationsCount,
              cybercrime_cases: cyberCasesCount,
              judicial_cases: judicialCasesCount,
              incidents: incidentsCount,
              notifications: notificationsCount,
              properties_count: propertiesCount,
              is_wanted: isWanted
            }
          };
        })
      );

      const citizens: SearchResult[] = citizensWithSummary;

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
