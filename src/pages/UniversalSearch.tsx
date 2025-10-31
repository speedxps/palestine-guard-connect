import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  User, 
  Car, 
  AlertCircle, 
  Radio, 
  Shield, 
  Scale,
  Loader2,
  Filter,
  History
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { useUniversalSearch } from "@/hooks/useUniversalSearch";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import policeLogo from "@/assets/police-logo.png";

const UniversalSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchType, setSearchType] = useState("all");
  const { search, loading, results } = useUniversalSearch();

  // البحث التلقائي مع debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        search(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      search(searchTerm);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const getCategoryCount = (category: string) => {
    switch (category) {
      case 'citizens':
        return results.citizens.length;
      case 'vehicles':
        return results.vehicles.length;
      case 'incidents':
        return results.incidents.length;
      case 'patrols':
        return results.patrols.length;
      case 'cybercrime_cases':
        return results.cybercrimeCases.length;
      case 'judicial_cases':
        return results.judicialCases.length;
      default:
        return results.total;
    }
  };

  const renderResults = (category: string) => {
    let resultsList = [];
    
    if (category === 'all') {
      resultsList = [
        ...results.citizens,
        ...results.vehicles,
        ...results.incidents,
        ...results.patrols,
        ...results.cybercrimeCases,
        ...results.judicialCases
      ].sort((a, b) => {
        if (!a.created_at || !b.created_at) return 0;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else if (category === 'citizens') {
      resultsList = results.citizens;
    } else if (category === 'vehicles') {
      resultsList = results.vehicles;
    } else if (category === 'incidents') {
      resultsList = results.incidents;
    } else if (category === 'patrols') {
      resultsList = results.patrols;
    } else if (category === 'cybercrime_cases') {
      resultsList = results.cybercrimeCases;
    } else if (category === 'judicial_cases') {
      resultsList = results.judicialCases;
    }

    if (resultsList.length === 0) {
      return (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm.trim() ? 'لا توجد نتائج للبحث' : 'ابدأ البحث للعثور على النتائج'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {resultsList.map((result) => (
          <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Back Button - Fixed Position */}
      <div className="fixed top-4 right-4 z-10">
        <BackButton />
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Header with Logo */}
        <div className="flex flex-col items-center mb-6 md:mb-8 space-y-3 md:space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
            <img 
              src={policeLogo} 
              alt="شعار الشرطة" 
              className="relative w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl"
            />
          </div>
          <div className="text-center">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1">
              نظام البحث الشامل
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              ابحث في جميع قواعد البيانات من مكان واحد
            </p>
          </div>
        </div>

        {/* Search Card */}
        <Card className="mb-6 shadow-lg border-primary/20">
          <CardContent className="pt-4 md:pt-6">
            <div className="space-y-3 md:space-y-4">
              {/* Search Type Selector */}
              <div className="w-full">
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="w-full h-10 md:h-12 text-sm md:text-base border-2">
                    <SelectValue placeholder="اختر نوع البحث" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">جميع السجلات</SelectItem>
                    <SelectItem value="name">الاسم</SelectItem>
                    <SelectItem value="national_id">رقم الهوية</SelectItem>
                    <SelectItem value="plate_number">رقم المركبة</SelectItem>
                    <SelectItem value="violation_number">رقم المخالفة</SelectItem>
                    <SelectItem value="incident_number">رقم البلاغ</SelectItem>
                    <SelectItem value="case_number">رقم القضية</SelectItem>
                    <SelectItem value="patrol_name">اسم الدورية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Input */}
              <div className="flex gap-2">
                <Input
                  placeholder={
                    searchType === "name" ? "ابحث عن الاسم..." :
                    searchType === "national_id" ? "ابحث عن رقم الهوية..." :
                    searchType === "plate_number" ? "ابحث عن رقم المركبة..." :
                    searchType === "violation_number" ? "ابحث عن رقم المخالفة..." :
                    searchType === "incident_number" ? "ابحث عن رقم البلاغ..." :
                    searchType === "case_number" ? "ابحث عن رقم القضية..." :
                    searchType === "patrol_name" ? "ابحث عن اسم الدورية..." :
                    "ابحث عن أي شيء..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-10 md:h-12 text-sm md:text-base lg:text-lg border-2 focus:border-primary"
                  dir="rtl"
                />
                <Button 
                  onClick={handleSearchClick}
                  disabled={loading || !searchTerm.trim()}
                  size="lg"
                  className="px-4 md:px-6 h-10 md:h-12"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                </Button>
              </div>

              {/* Quick Filter Hints - Hidden on mobile to save space */}
              <div className="hidden sm:flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className="text-xs">
                  رقم هوية
                </Badge>
                <Badge variant="outline" className="text-xs">
                  اسم
                </Badge>
                <Badge variant="outline" className="text-xs">
                  رقم سيارة
                </Badge>
                <Badge variant="outline" className="text-xs">
                  رقم بلاغ
                </Badge>
                <Badge variant="outline" className="text-xs">
                  قضية
                </Badge>
              </div>

              {/* Stats */}
              {results.total > 0 && (
                <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center pt-2">
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <User className="h-3 w-3" />
                    {results.citizens.length}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Car className="h-3 w-3" />
                    {results.vehicles.length}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {results.incidents.length}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Radio className="h-3 w-3" />
                    {results.patrols.length}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Shield className="h-3 w-3" />
                    {results.cybercrimeCases.length}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Scale className="h-3 w-3" />
                    {results.judicialCases.length}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Tabs */}
        {results.total > 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-4 md:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 mb-6 h-auto">
                  <TabsTrigger value="all" className="text-xs py-2">
                    الكل ({results.total})
                  </TabsTrigger>
                  <TabsTrigger value="citizens" className="text-xs py-2">
                    <User className="h-3 w-3 md:ml-1" />
                    <span className="hidden md:inline">({results.citizens.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="vehicles" className="text-xs py-2">
                    <Car className="h-3 w-3 md:ml-1" />
                    <span className="hidden md:inline">({results.vehicles.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="incidents" className="text-xs py-2 hidden md:flex">
                    <AlertCircle className="h-3 w-3 ml-1" />
                    ({results.incidents.length})
                  </TabsTrigger>
                  <TabsTrigger value="patrols" className="text-xs py-2 hidden md:flex">
                    <Radio className="h-3 w-3 ml-1" />
                    ({results.patrols.length})
                  </TabsTrigger>
                  <TabsTrigger value="cybercrime_cases" className="text-xs py-2 hidden md:flex">
                    <Shield className="h-3 w-3 ml-1" />
                    ({results.cybercrimeCases.length})
                  </TabsTrigger>
                  <TabsTrigger value="judicial_cases" className="text-xs py-2 hidden md:flex">
                    <Scale className="h-3 w-3 ml-1" />
                    ({results.judicialCases.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all">{renderResults('all')}</TabsContent>
                <TabsContent value="citizens">{renderResults('citizens')}</TabsContent>
                <TabsContent value="vehicles">{renderResults('vehicles')}</TabsContent>
                <TabsContent value="incidents">{renderResults('incidents')}</TabsContent>
                <TabsContent value="patrols">{renderResults('patrols')}</TabsContent>
                <TabsContent value="cybercrime_cases">{renderResults('cybercrime_cases')}</TabsContent>
                <TabsContent value="judicial_cases">{renderResults('judicial_cases')}</TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : searchTerm.trim() && !loading ? (
          <Card className="shadow-lg">
            <CardContent className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">لا توجد نتائج للبحث</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default UniversalSearch;
