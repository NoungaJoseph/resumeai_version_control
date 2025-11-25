
import React from 'react';
import { MagicResumeIcon } from './Icons';

interface LogoProps {
  variant?: 'blue' | 'dark';
  className?: string;
  textClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'blue', 
  className = '', 
  textClassName = '' 
}) => {
  const bgClass = variant === 'blue' ? 'bg-blue-600' : 'bg-slate-900';
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-8 h-8 ${bgClass} rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm transition-transform hover:scale-105`}>
        <MagicResumeIcon className="w-5 h-5" />
      </div>
      <span className={`font-bold text-xl text-slate-900 tracking-tight ${textClassName}`}>
        ResumeAI
      </span>
    </div>
  );
};
