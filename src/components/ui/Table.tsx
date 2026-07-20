

import React from 'react';
import { cn } from '../../lib/utils';

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full border-collapse text-sm', className)} {...props} />
    </div>);

}

export function THead({ children }: {children: React.ReactNode;}) {
  return (
    <thead>
      <tr className="border-b border-border">{children}</tr>
    </thead>);

}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted',
        className
      )}
      {...props} />);


}

export function TBody({ children }: {children: React.ReactNode;}) {
  return <tbody>{children}</tbody>;
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn('border-b border-border/70 transition-colors last:border-0 hover:bg-background/60', className)}
      {...props} />);


}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('whitespace-nowrap px-4 py-3.5 text-foreground', className)} {...props} />;
}