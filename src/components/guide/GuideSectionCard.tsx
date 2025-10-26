import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GuideSectionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  itemCount: number;
  onClick: () => void;
}

export const GuideSectionCard: React.FC<GuideSectionCardProps> = ({
  title,
  description,
  icon: Icon,
  color,
  itemCount,
  onClick
}) => {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 hover:border-primary/50"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className={`bg-gradient-to-br ${color} rounded-2xl p-4 mb-4 flex items-center justify-center w-20 h-20 mx-auto group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-10 w-10 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-center mb-2 text-gray-900 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-gray-600 text-center mb-4 min-h-[40px]">
          {description}
        </p>
        
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="bg-gray-100 hover:bg-gray-200">
            {itemCount} موضوع
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
