
import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) =>
  <input
    ref={ref}
    className={cn(
      'h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted/70 transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15',
      className
    )}
    {...props} />


);
Input.displayName = 'Input';

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('mb-1.5 block text-xs font-medium text-foreground', className)} {...props} />;
}

export function Field({ label, children }: {label: string;children: React.ReactNode;}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>);

}