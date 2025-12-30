
import React from 'react';
import { MagicResumeIcon } from './Icons';

interface LogoProps {
  variant?: 'blue' | 'dark';
  className?: string;
  textClassName?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'blue',
  className = '',
  textClassName = '',
  onClick
}) => {
  return (
    <div
      className={`flex items-center gap-2 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm transition-transform hover:scale-105" />
      <span className={`font-bold text-xl text-slate-900 tracking-tight ${textClassName}`}>
        Resume Builder
      </span>
    </div>
  );
};
