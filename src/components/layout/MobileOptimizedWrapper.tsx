import React from 'react';

interface MobileOptimizedWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * مكون wrapper محسّن للهواتف لضمان التوافق مع جميع أحجام الشاشات
 */
export const MobileOptimizedWrapper: React.FC<MobileOptimizedWrapperProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`
      w-full 
      max-w-full 
      min-h-screen 
      overflow-x-hidden 
      bg-background 
      ${className}
    `}>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
};

/**
 * Grid محسّن للهواتف مع breakpoints مرنة
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = 'gap-4',
  className = ''
}) => {
  const getGridClasses = () => {
    const classes = ['grid'];
    
    // إضافة classes للشبكة بناءً على الشاشة
    if (cols.xs) classes.push(`grid-cols-${cols.xs}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    
    classes.push(gap);
    
    return classes.join(' ');
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {children}
    </div>
  );
};

/**
 * بطاقة محسّنة للهواتف
 */
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = '',
  padding = 'md',
  onClick
}) => {
  const getPaddingClass = () => {
    switch (padding) {
      case 'sm': return 'p-3 sm:p-4';
      case 'md': return 'p-4 sm:p-6';
      case 'lg': return 'p-6 sm:p-8';
      default: return 'p-4 sm:p-6';
    }
  };

  return (
    <div 
      className={`
        bg-white 
        rounded-lg sm:rounded-xl 
        border border-gray-200 
        shadow-sm 
        transition-all 
        duration-200 
        ${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-[1.01]' : ''}
        ${getPaddingClass()}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default MobileOptimizedWrapper;