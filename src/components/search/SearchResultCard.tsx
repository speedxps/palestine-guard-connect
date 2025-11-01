import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Car, 
  AlertTriangle, 
  Radio, 
  Shield, 
  Scale, 
  Eye,
  Calendar,
  Hash
} from 'lucide-react';

interface SearchResultCardProps {
  result: any;
}

export const SearchResultCard = ({ result }: SearchResultCardProps) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (result.type) {
      case 'citizen':
        return <User className="w-5 h-5 text-blue-500" />;
      case 'vehicle':
        return <Car className="w-5 h-5 text-green-500" />;
      case 'incident':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'patrol':
        return <Radio className="w-5 h-5 text-purple-500" />;
      case 'cybercrime_case':
        return <Shield className="w-5 h-5 text-red-500" />;
      case 'judicial_case':
        return <Scale className="w-5 h-5 text-indigo-500" />;
      default:
        return null;
    }
  };

  const handleClick = () => {
    switch (result.type) {
      case 'citizen':
        navigate(`/citizen-profile/${result.national_id}`);
        break;
      case 'vehicle':
        navigate(`/vehicle-record/${result.id}`);
        break;
      case 'incident':
        navigate(`/incident-record/${result.id}`);
        break;
      case 'patrol':
        navigate(`/patrol-record/${result.id}`);
        break;
      case 'cybercrime_case':
        navigate(`/cybercrime-case-record/${result.id}`);
        break;
      case 'judicial_case':
        navigate(`/judicial-case-record/${result.id}`);
        break;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer border-r-4 border-r-primary/50"
          onClick={handleClick}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg truncate">{result.title}</h3>
              <Badge variant="outline" className="shrink-0">
                {result.type === 'citizen' && 'مواطن'}
                {result.type === 'vehicle' && 'مركبة'}
                {result.type === 'incident' && 'بلاغ'}
                {result.type === 'patrol' && 'دورية'}
                {result.type === 'cybercrime_case' && 'جريمة إلكترونية'}
                {result.type === 'judicial_case' && 'قضية قضائية'}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {result.subtitle}
            </p>

            {/* Metadata */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {result.metadata?.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(result.metadata.date).toLocaleDateString('ar')}</span>
                </div>
              )}
              
              {result.metadata?.status && (
                <Badge variant="secondary" className="text-xs">
                  {result.metadata.status}
                </Badge>
              )}

              {result.metadata?.number && (
                <div className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  <span>{result.metadata.number}</span>
                </div>
              )}
            </div>

            {/* Summary للمواطن */}
            {result.type === 'citizen' && result.summary && (
              <div className="mt-3 flex flex-wrap gap-2">
                {result.summary.vehicleCount > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Car className="w-3 h-3" />
                    {result.summary.vehicleCount} مركبة
                  </Badge>
                )}
                {result.summary.violationCount > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {result.summary.violationCount} مخالفة
                  </Badge>
                )}
                {result.summary.caseCount > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Scale className="w-3 h-3" />
                    {result.summary.caseCount} قضية
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button variant="ghost" size="sm" className="shrink-0">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
