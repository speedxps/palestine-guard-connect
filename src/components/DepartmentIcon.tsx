import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DepartmentIconProps {
  icon: LucideIcon;
  gradient: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: {
    container: 'w-10 h-10',
    icon: 'w-5 h-5'
  },
  md: {
    container: 'w-14 h-14',
    icon: 'w-7 h-7'
  },
  lg: {
    container: 'w-16 h-16',
    icon: 'w-8 h-8'
  },
  xl: {
    container: 'w-20 h-20',
    icon: 'w-10 h-10'
  }
};

export const DepartmentIcon: React.FC<DepartmentIconProps> = ({
  icon: Icon,
  gradient,
  size = 'md',
  animated = true,
  className
}) => {
  return (
    <div
      className={cn(
        'relative rounded-2xl flex items-center justify-center',
        'shadow-lg backdrop-blur-sm',
        'bg-gradient-to-br',
        gradient,
        sizeClasses[size].container,
        animated && 'transition-all duration-300 hover:scale-110 hover:rotate-3 hover:shadow-2xl',
        className
      )}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Inner gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/10 to-transparent" />
      
      {/* Icon */}
      <Icon 
        className={cn(
          'relative z-10 text-white drop-shadow-lg',
          sizeClasses[size].icon,
          animated && 'transition-transform duration-300 group-hover:scale-110'
        )} 
        strokeWidth={2.5}
      />
      
      {/* Shine effect */}
      {animated && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full" 
               style={{ transition: 'transform 0.8s ease-in-out, opacity 0.5s' }} />
        </div>
      )}
    </div>
  );
};

// Pre-configured department icons
export const departmentIcons = {
  admin: {
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    shadow: 'shadow-yellow-500/50'
  },
  traffic: {
    gradient: 'from-blue-400 via-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/50'
  },
  cid: {
    gradient: 'from-red-400 via-red-500 to-red-600',
    shadow: 'shadow-red-500/50'
  },
  special: {
    gradient: 'from-purple-400 via-purple-500 to-purple-600',
    shadow: 'shadow-purple-500/50'
  },
  cybercrime: {
    gradient: 'from-indigo-400 via-indigo-500 to-indigo-600',
    shadow: 'shadow-indigo-500/50'
  },
  judicial: {
    gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
    shadow: 'shadow-emerald-500/50'
  }
};
