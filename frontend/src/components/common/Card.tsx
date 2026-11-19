import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hoverEffect = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 rounded-xl shadow-xs transition-all duration-200',
        hoverEffect && 'hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60 cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
};
