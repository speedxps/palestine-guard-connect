import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Search, Camera } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TourismSite {
  id: string;
  name: string;
  location: string;
  type: string;
  status: string;
  visitors_today: number;
}

export default function TourismSites() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sites, setSites] = useState<TourismSite[]>([
    { id: '1', name: 'كنيسة المهد', location: 'بيت لحم', type: 'ديني', status: 'active', visitors_today: 234 },
    { id: '2', name: 'الحرم الإبراهيمي', location: 'الخليل', type: 'ديني', status: 'active', visitors_today: 156 },
    { id: '3', name: 'البلدة القديمة', location: 'القدس', type: 'تاريخي', status: 'active', visitors_today: 487 },
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              المواقع السياحية
            </h1>
            <p className="text-muted-foreground">إدارة ومراقبة المواقع السياحية</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            موقع جديد
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث عن موقع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <Card key={site.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{site.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {site.location}
                    </div>
                  </div>
                  <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                    {site.status === 'active' ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">زوار اليوم</p>
                    <p className="text-2xl font-bold text-primary">{site.visitors_today}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    المراقبة
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
