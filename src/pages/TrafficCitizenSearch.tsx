import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User, IdCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BackButton } from '@/components/BackButton';

const TrafficCitizenSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'id'>('id');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    fetchAllCitizens();
  }, []);

  const fetchAllCitizens = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('citizens')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setResults(data || []);
    } catch (error) {
      console.error('Error fetching citizens:', error);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <BackButton />
          <h1 className="text-3xl font-bold text-primary">سجل المواطنين المركزي</h1>
          <div />
        </div>

        {/* Search Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-6 w-6" />
              البحث عن مواطن
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Type Toggle */}
            <div className="flex gap-2">
              <Button
                variant={searchType === 'id' ? 'default' : 'outline'}
                onClick={() => setSearchType('id')}
                className="flex-1"
              >
                <IdCard className="h-4 w-4 ml-2" />
                رقم الهوية
              </Button>
              <Button
                variant={searchType === 'name' ? 'default' : 'outline'}
                onClick={() => setSearchType('name')}
                className="flex-1"
              >
                <User className="h-4 w-4 ml-2" />
                الاسم
              </Button>
            </div>

            {/* Search Input */}
            <div className="flex gap-2">
              <Input
                placeholder={searchType === 'id' ? 'أدخل رقم الهوية...' : 'أدخل اسم المواطن...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4 ml-2" />
                {loading ? 'جاري البحث...' : 'بحث'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((citizen) => (
              <Card
                key={citizen.id}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary"
                onClick={() => navigate(`/department/traffic/citizen-record/${citizen.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {citizen.photo_url ? (
                      <img
                        src={citizen.photo_url}
                        alt={citizen.full_name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{citizen.full_name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        رقم الهوية: {citizen.national_id}
                      </p>
                      <div className="flex gap-2 text-xs">
                        {citizen.phone && (
                          <span className="bg-primary/10 px-2 py-1 rounded">
                            📱 {citizen.phone}
                          </span>
                        )}
                        {citizen.has_vehicle && (
                          <span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
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
        )}
      </div>
    </div>
  );
};

export default TrafficCitizenSearch;
