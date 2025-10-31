import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Car, 
  AlertCircle, 
  Radio, 
  Shield, 
  Scale,
  ChevronRight 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchResult } from "@/hooks/useUniversalSearch";

interface SearchResultCardProps {
  result: SearchResult;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'citizen':
      return <User className="h-5 w-5" />;
    case 'vehicle':
      return <Car className="h-5 w-5" />;
    case 'incident':
      return <AlertCircle className="h-5 w-5" />;
    case 'patrol':
      return <Radio className="h-5 w-5" />;
    case 'cybercrime_case':
      return <Shield className="h-5 w-5" />;
    case 'judicial_case':
      return <Scale className="h-5 w-5" />;
    default:
      return <User className="h-5 w-5" />;
  }
};

const getTypeName = (type: string) => {
  switch (type) {
    case 'citizen':
      return 'مواطن';
    case 'vehicle':
      return 'مركبة';
    case 'incident':
      return 'بلاغ';
    case 'patrol':
      return 'دورية';
    case 'cybercrime_case':
      return 'قضية جنائية';
    case 'judicial_case':
      return 'قضية قضائية';
    default:
      return 'غير محدد';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'citizen':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'vehicle':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'incident':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'patrol':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'cybercrime_case':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'judicial_case':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

const getNavigationPath = (result: SearchResult) => {
  switch (result.type) {
    case 'citizen':
      // الانتقال للملف الشامل باستخدام رقم الهوية
      return result.national_id ? `/citizen-profile/${result.national_id}` : `/department/cid/suspect-record/${result.id}`;
    case 'vehicle':
      return `/vehicle-record/${result.id}`;
    case 'incident':
      return `/incident-record/${result.id}`;
    case 'patrol':
      return `/patrol-record/${result.id}`;
    case 'cybercrime_case':
      return `/cybercrime-case-record/${result.id}`;
    case 'judicial_case':
      return `/judicial-case-record/${result.id}`;
    default:
      return '#';
  }
};

export const SearchResultCard = ({ result }: SearchResultCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const path = getNavigationPath(result);
    if (path !== '#') {
      navigate(path);
    }
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-border/50 hover:border-primary/30"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
              {getTypeIcon(result.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge 
                  variant="outline" 
                  className={`${getTypeColor(result.type)} border`}
                >
                  {getTypeName(result.type)}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-foreground mb-1 truncate">
                {result.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-1">
                {result.subtitle}
              </p>
              
              {result.description && (
                <p className="text-xs text-muted-foreground/70">
                  {result.description}
                </p>
              )}
              
              {result.created_at && (
                <p className="text-xs text-muted-foreground/50 mt-2">
                  التاريخ: {new Date(result.created_at).toLocaleDateString('ar-PS')}
                </p>
              )}
              
              {/* عرض ملخص المواطن */}
              {result.type === 'citizen' && result.summary && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {result.summary.vehicles_count! > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      🚗 {result.summary.vehicles_count} مركبة
                    </Badge>
                  )}
                  {result.summary.violations_count! > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      ⚠️ {result.summary.violations_count} مخالفة
                    </Badge>
                  )}
                  {result.summary.cybercrime_cases! > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      💻 {result.summary.cybercrime_cases} قضية
                    </Badge>
                  )}
                  {result.summary.is_wanted && (
                    <Badge variant="destructive" className="text-xs">
                      🚨 مطلوب
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
