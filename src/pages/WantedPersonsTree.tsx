import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, MapPin, AlertTriangle, Calendar, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type WantedPerson = {
  id: string;
  citizen_id: string;
  monitor_start_date: string;
  monitor_end_date: string | null;
  reason: string | null;
  is_active: boolean;
  citizen: {
    national_id: string;
    full_name: string;
    photo_url: string | null;
    gender: string | null;
    date_of_birth: string | null;
  };
  family_members: {
    id: string;
    relative_name: string;
    relative_national_id: string | null;
    relation: string;
  }[];
  traffic_records: {
    id: string;
    record_type: string;
    record_date: string;
    details: string | null;
  }[];
};

type SuspectDetails = {
  name: string;
  area: string;
  crimeType: string;
  age: number;
  description: string;
  associates: string[];
  vehicle: string;
  travelHistory: string;
  activities: string;
  photo: string;
};

// Sample detailed suspect data
const sampleSuspects: Record<string, SuspectDetails> = {
  "محمد أحمد": {
    name: "محمد أحمد",
    area: "رام الله",
    crimeType: "سرقة",
    age: 28,
    description: "محمد أحمد من رام الله، في أواخر العشرينات من عمره، معروف بقضاء معظم وقته مع ثلاثة أصدقاء من حيه: سامر، وليد، وعماد. غالباً ما يتجمعون في مقهى شعبي في وسط المدينة أو في بيتونيا، وأحياناً يذهبون إلى أريحا في عطل نهاية الأسبوع. محمد أعزب وليس لديه أطفال. قبل عامين، سافر إلى تركيا لمدة شهر تقريباً - يُقال لأنشطة تجارية مشكوك في طبيعتها. يعمل حالياً في محل تصليح هواتف، لكن في المساء ينشغل بأنشطة جانبية غير معلنة. يقود كيا ريو فضية موديل 2015، ومعروف بأنه يوقفها في شارع جانبي بدلاً من قرب منزله لتجنب المراقبة.",
    associates: ["سامر", "وليد", "عماد"],
    vehicle: "كيا ريو فضية 2015",
    travelHistory: "سفر إلى تركيا لشهر واحد قبل عامين",
    activities: "يعمل في محل تصليح هواتف، أنشطة مسائية مشكوك فيها",
    photo: "/placeholder.svg"
  },
  "علي حسن": {
    name: "علي حسن",
    area: "غزة",
    crimeType: "احتيال",
    age: 35,
    description: "علي حسن من غزة، 35 عاماً، متزوج وله ابنتان. يقضي معظم وقته في مكتب صغير حيث يعمل كوسيط تجاري، لكنه كثيراً ما يُشاهد مع شريكين، نادر وحسين، وكلاهما متورط سابقاً في قضايا احتيال. يحب الجلوس في مقاهي على البحر، خاصة واحد يُدعى 'الموجة الزرقاء'. علي لم يسافر خارج غزة بسبب القيود المحلية ولكنه يحتفظ بعلاقات قوية مع تجار في الضفة الغربية. يقود هيونداي إلنترا سوداء موديل 2017 ويغير مساراته يومياً لتجنب إنشاء أنماط يمكن التنبؤ بها. يذكر الجيران أنه أحياناً يختفي لمدة يومين أو ثلاثة أيام قبل أن يعود دون تفسير.",
    associates: ["نادر", "حسين"],
    vehicle: "هيونداي إلنترا سوداء 2017",
    travelHistory: "لم يسافر خارج غزة بسبب القيود",
    activities: "وسيط تجاري، علاقات مع تجار الضفة الغربية",
    photo: "/placeholder.svg"
  },
  "خالد يوسف": {
    name: "خالد يوسف",
    area: "نابلس",
    crimeType: "تهريب",
    age: 42,
    description: "خالد يوسف من نابلس، في الأربعينات من عمره، أعزب وليس له أطفال. يقضي معظم وقته في السفر بين نابلس وطولكرم، وكثيراً ما يُشاهد بالقرب من المناطق الحدودية قريباً من جنين. رفاقه المعتادون هم شادي وأبو عمر، وكلاهما معروف بتورطه الطويل في التهريب. خالد عمل سابقاً كسائق شاحنة، مما أعطاه معرفة واسعة بالطرق الخلفية والطرق الجانبية ذات الوجود الأمني الأقل. يمتلك سيارة دفع رباعي باجيرو بيضاء، يستخدمها للرحلات الطويلة، وأحياناً يتركها في ورش تصليح وهمية لإخفاء تحركاته. في عام 2021، سافر إلى الأردن لمدة أسبوعين، يُقال لترتيب صفقة تهريب كبيرة.",
    associates: ["شادي", "أبو عمر"],
    vehicle: "ميتسوبيشي باجيرو بيضاء",
    travelHistory: "سفر إلى الأردن لأسبوعين في 2021",
    activities: "سائق شاحنة سابق، خبرة في الطرق الخلفية",
    photo: "/placeholder.svg"
  }
};

export default function WantedPersonsTree() {
  const [wantedPersons, setWantedPersons] = useState<WantedPerson[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<WantedPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<"lastname" | "area" | "crime">("lastname");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<WantedPerson | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWantedPersons();
  }, []);

  useEffect(() => {
    filterAndGroupPersons();
  }, [wantedPersons, viewType, searchTerm]);

  const fetchWantedPersons = async () => {
    try {
      const { data, error } = await supabase
        .from("wanted_persons")
        .select(`
          *,
          citizen:citizens!wanted_persons_citizen_id_fkey (
            national_id,
            full_name,
            photo_url,
            gender,
            date_of_birth
          )
        `)
        .eq("is_active", true);

      if (error) throw error;

      // Fetch family members and traffic records for each person
      const enrichedData = await Promise.all(
        (data || []).map(async (person: any) => {
          const [familyResult, trafficResult] = await Promise.all([
            supabase
              .from("family_members")
              .select("id, relative_name, relative_national_id, relation")
              .eq("person_id", person.citizen_id),
            supabase
              .from("traffic_records")
              .select("id, record_type, record_date, details")
              .eq("national_id", person.citizen.national_id)
          ]);

          return {
            ...person,
            family_members: familyResult.data || [],
            traffic_records: trafficResult.data || []
          };
        })
      );

      setWantedPersons(enrichedData);
    } catch (error) {
      console.error("Error fetching wanted persons:", error);
      toast({ title: "خطأ", description: "فشل في تحميل بيانات المطلوبين", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filterAndGroupPersons = () => {
    let filtered = wantedPersons;

    if (searchTerm) {
      filtered = filtered.filter(person =>
        person.citizen.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.citizen.national_id.includes(searchTerm)
      );
    }

    setFilteredPersons(filtered);
  };

  const groupPersonsByType = () => {
    const groups: Record<string, WantedPerson[]> = {};
    
    filteredPersons.forEach(person => {
      let key = "";
      switch (viewType) {
        case "lastname":
          key = person.citizen.full_name.split(" ").pop() || "غير محدد";
          break;
        case "area":
          // For demo purposes, using a simple mapping
          const areas = ["رام الله", "غزة", "نابلس", "الخليل", "جنين"];
          key = areas[Math.floor(Math.random() * areas.length)];
          break;
        case "crime":
          key = person.reason || "غير محدد";
          break;
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(person);
    });

    return groups;
  };

  const openDetails = (person: WantedPerson) => {
    setSelectedPerson(person);
    setDetailsOpen(true);
  };

  const getSuspectDetails = (name: string): SuspectDetails | null => {
    return sampleSuspects[name] || null;
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  const groups = groupPersonsByType();

  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">الهيكل الشجري للمطلوبين</h1>
        <p className="text-muted-foreground mt-2">عرض تفاعلي للأشخاص المطلوبين مع علاقاتهم العائلية والأمنية.</p>
      </header>

      <div className="grid gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>خيارات العرض</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">نوع التجميع</label>
                <Select value={viewType} onValueChange={(value: any) => setViewType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastname">الأسماء العائلية</SelectItem>
                    <SelectItem value="area">منطقة الإقامة</SelectItem>
                    <SelectItem value="crime">نوع الجريمة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">البحث</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث بالاسم أو رقم الهوية..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <div className="text-sm text-muted-foreground">
                  إجمالي المطلوبين: <span className="font-semibold">{filteredPersons.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tree Structure Display */}
        <div className="space-y-8">
          {Object.entries(groups).map(([groupName, persons]) => (
            <Card key={groupName}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {viewType === "lastname" && <Users className="w-5 h-5" />}
                  {viewType === "area" && <MapPin className="w-5 h-5" />}
                  {viewType === "crime" && <AlertTriangle className="w-5 h-5" />}
                  {groupName} ({persons.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {persons.map((person) => (
                    <div key={person.id} className="text-center space-y-3">
                      {/* Photo with connections */}
                      <div className="relative mx-auto">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-muted border-4 border-red-500 mx-auto">
                          {person.citizen.photo_url ? (
                            <img 
                              src={person.citizen.photo_url} 
                              alt={person.citizen.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              لا توجد صورة
                            </div>
                          )}
                        </div>
                        
                        {/* Alert indicator */}
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-3 h-3 text-white" />
                        </div>
                        
                        {/* Family connections (simplified visualization) */}
                        {person.family_members.length > 0 && (
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <Users className="w-2 h-2 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Name and details */}
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">{person.citizen.full_name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {person.citizen.national_id}
                        </p>
                        <Badge variant="destructive" className="text-xs">
                          مطلوب
                        </Badge>
                        {person.family_members.length > 0 && (
                          <p className="text-xs text-blue-600">
                            {person.family_members.length} من أفراد الأسرة
                          </p>
                        )}
                      </div>
                      
                      {/* View details button */}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openDetails(person)}
                        className="w-full"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        التفاصيل
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Suspect Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل المشتبه به</DialogTitle>
          </DialogHeader>
          {selectedPerson && (
            <div className="space-y-6">
              {/* Main suspect info */}
              <div className="flex gap-6">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {selectedPerson.citizen.photo_url ? (
                    <img 
                      src={selectedPerson.citizen.photo_url} 
                      alt={selectedPerson.citizen.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      لا توجد صورة
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-3">
                  <h3 className="text-xl font-bold">{selectedPerson.citizen.full_name}</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <p><span className="font-medium">رقم الهوية:</span> {selectedPerson.citizen.national_id}</p>
                    <p><span className="font-medium">تاريخ الميلاد:</span> {selectedPerson.citizen.date_of_birth || "غير محدد"}</p>
                    <p><span className="font-medium">بداية المراقبة:</span> {new Date(selectedPerson.monitor_start_date).toLocaleDateString('ar-SA')}</p>
                    <p><span className="font-medium">السبب:</span> {selectedPerson.reason || "غير محدد"}</p>
                  </div>
                </div>
              </div>

              {/* Detailed profile */}
              {(() => {
                const suspectDetails = getSuspectDetails(selectedPerson.citizen.full_name);
                if (suspectDetails) {
                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle>الملف الشخصي التفصيلي</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm leading-relaxed">{suspectDetails.description}</p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium mb-2">المعاونون المعروفون:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {suspectDetails.associates.map((associate, index) => (
                                <li key={index}>{associate}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">معلومات إضافية:</h4>
                            <div className="space-y-1">
                              <p><span className="font-medium">المركبة:</span> {suspectDetails.vehicle}</p>
                              <p><span className="font-medium">تاريخ السفر:</span> {suspectDetails.travelHistory}</p>
                              <p><span className="font-medium">الأنشطة:</span> {suspectDetails.activities}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
                return null;
              })()}

              {/* Cases and violations */}
              <Card>
                <CardHeader>
                  <CardTitle>القضايا والمخالفات</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPerson.traffic_records.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPerson.traffic_records.map((record) => (
                        <div key={record.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge variant={record.record_type === "violation" ? "secondary" : "destructive"}>
                                {record.record_type === "violation" ? "مخالفة" : "قضية"}
                              </Badge>
                              <p className="text-sm mt-1">{record.details || "بدون تفاصيل"}</p>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {record.record_date}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">لا توجد قضايا أو مخالفات مسجلة.</p>
                  )}
                </CardContent>
              </Card>

              {/* Family members */}
              <Card>
                <CardHeader>
                  <CardTitle>أفراد الأسرة</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPerson.family_members.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedPerson.family_members.map((member) => (
                        <div key={member.id} className="border rounded-lg p-3">
                          <h4 className="font-medium">{member.relative_name}</h4>
                          <p className="text-sm text-muted-foreground">صلة القرابة: {member.relation}</p>
                          {member.relative_national_id && (
                            <p className="text-sm text-muted-foreground">رقم الهوية: {member.relative_national_id}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">لا توجد بيانات عائلية مسجلة.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}