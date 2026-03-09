import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
}

const COLORS = {
  default: { bg: '#2a2a4a', color: '#e2e8f0' },
  success: { bg: '#22c55e22', color: '#22c55e' },
  danger: { bg: '#ef444422', color: '#ef4444' },
  warning: { bg: '#f59e0b22', color: '#f59e0b' },
  info: { bg: '#8b5cf622', color: '#8b5cf6' },
};

export default function Badge({ label, variant = 'default' }: BadgeProps): React.ReactElement {
  const { bg, color } = COLORS[variant];
  return (
    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: bg, color }}>
      {label}
    </span>
  );
}
