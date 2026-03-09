import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export default function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps): React.ReactElement {
  const sizeClass = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClass} border-2 border-t-transparent rounded-full animate-spin`} style={{ borderColor: '#f59e0b', borderTopColor: 'transparent' }} />
      {label && <span className="text-sm" style={{ color: '#94a3b8' }}>{label}</span>}
    </div>
  );
}
