



import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon, ArrowDownRightIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  delta?: {value: string;positive: boolean;};
  hint?: string;
  index?: number;
}

const toneMap = {
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info'
};

export function StatCard({ label, value, icon: Icon, tone = 'primary', delta, hint, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-xl border border-border bg-surface p-5 shadow-card">
      
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        {delta &&
        <span
          className={cn(
            'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
            delta.positive ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
          )}>
          
            {delta.positive ? <ArrowUpRightIcon className="h-3 w-3" /> : <ArrowDownRightIcon className="h-3 w-3" />}
            {delta.value}
          </span>
        }
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
      {hint && <p className="mt-2 text-xs text-muted/80">{hint}</p>}
    </motion.div>);

}