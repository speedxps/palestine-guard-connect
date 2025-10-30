import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User, IdCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BackButton } from '@/components/BackButton';
import policeLogo from '@/assets/police-logo.png';

const TrafficCitizenSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'id'>('id');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('الرجاء إدخال قيمة للبحث');
      return;
    }

    setLoading(true);
    try {
      let query = supabase.from('citizens').select('*');

      if (searchType === 'id') {
        query = query.eq('national_id', searchTerm);
      } else {
        query = query.or(`full_name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,family_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('لم يتم العثور على نتائج');
        setResults([]);
        return;
      }

      setResults(data);
      toast.success(`تم العثور على ${data.length} نتيجة`);
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <BackButton />
          <div className="flex items-center gap-2 sm:gap-4">
            <img src={policeLogo} alt="شعار الشرطة" className="h-10 w-10 sm:h-16 sm:w-16 object-contain flex-shrink-0" />
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary truncate">سجل المواطنين المركزي</h1>
          </div>
          <div className="hidden sm:block" />
        </div>

        {/* Search Card */}
        <Card className="shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
              <Search className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              البحث عن مواطن
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {/* Search Type Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={searchType === 'id' ? 'default' : 'outline'}
                onClick={() => setSearchType('id')}
                className="h-10 sm:h-11 text-sm sm:text-base"
              >
                <IdCard className="h-4 w-4 ml-2 flex-shrink-0" />
                <span className="truncate">رقم الهوية</span>
              </Button>
              <Button
                variant={searchType === 'name' ? 'default' : 'outline'}
                onClick={() => setSearchType('name')}
                className="h-10 sm:h-11 text-sm sm:text-base"
              >
                <User className="h-4 w-4 ml-2 flex-shrink-0" />
                <span className="truncate">الاسم</span>
              </Button>
            </div>

            {/* Search Input */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder={searchType === 'id' ? 'أدخل رقم الهوية...' : 'أدخل اسم المواطن...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 text-sm sm:text-base h-10 sm:h-11"
              />
              <Button onClick={handleSearch} disabled={loading} className="h-10 sm:h-11 text-sm sm:text-base whitespace-nowrap">
                <Search className="h-4 w-4 ml-2 flex-shrink-0" />
                <span>{loading ? 'جاري البحث...' : 'بحث'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {results.map((citizen) => (
              <Card
                key={citizen.id}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary"
                onClick={() => navigate(`/department/traffic/citizen-record/${citizen.id}`)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {citizen.photo_url ? (
                      <img
                        src={citizen.photo_url}
                        alt={citizen.full_name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg mb-1 truncate">{citizen.full_name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 truncate">
                        رقم الهوية: {citizen.national_id}
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2 text-xs">
                        {citizen.phone && (
                          <span className="bg-primary/10 px-2 py-1 rounded truncate">
                            📱 {citizen.phone}
                          </span>
                        )}
                        {citizen.has_vehicle && (
                          <span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded whitespace-nowrap">
                            🚗 لديه مركبة
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TrafficCitizenSearch;
