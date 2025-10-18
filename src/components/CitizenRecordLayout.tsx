import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface RecordField {
  label: string;
  value: string;
  highlighted?: boolean;
}

export interface ActionButton {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface CitizenRecordLayoutProps {
  title: string;
  subtitle: string;
  fields: RecordField[];
  actions: ActionButton[];
  showCallButton?: boolean;
  onCallClick?: () => void;
}

export const CitizenRecordLayout: React.FC<CitizenRecordLayoutProps> = ({
  title,
  subtitle,
  fields,
  actions,
  showCallButton = true,
  onCallClick
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="md:hidden"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <h1 className="text-xl md:text-2xl font-bold text-primary flex-1 text-center md:text-right">
              {title}
            </h1>

            {showCallButton && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onCallClick}
                  className="text-primary hover:text-primary"
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="hidden md:flex"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Info Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="pb-3">
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{field.label}</span>
                  <span className={`font-semibold ${
                    field.highlighted 
                      ? 'text-primary text-lg' 
                      : 'text-foreground'
                  }`}>
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* Subtitle */}
        <div className="text-center mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-primary">
            {subtitle}
          </h2>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {actions.map((action, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
              onClick={action.onClick}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
                <div className={`mb-4 ${action.color || 'text-primary'}`}>
                  {action.icon}
                </div>
                <p className="text-sm md:text-base font-semibold text-center">
                  {action.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
