

import React from 'react';
import { cn } from '../../lib/utils';
import { initials } from '../../lib/utils';

const palette = [
'bg-primary/10 text-primary',
'bg-info-soft text-info',
'bg-success-soft text-success',
'bg-warning-soft text-warning',
'bg-slate2/15 text-slate2'];


export function Avatar({ name, className }: {name: string;className?: string;}) {
  const idx = name.charCodeAt(0) % palette.length;
  return (
    <span
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        palette[idx],
        className
      )}>
      
      {initials(name)}
    </span>);

}