import React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Drawer({ open, onClose, title, description, children, footer, className }: DrawerProps) {
  return createPortal(
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-50">
          <motion.button
          type="button"
          aria-label="Close drawer"
          className="absolute inset-0 h-full w-full cursor-default bg-foreground/30 backdrop-blur-[1px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} />
        
          <motion.aside
          role="dialog"
          aria-modal="true"
          className={cn('absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-pop', className)}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.22, ease: 'easeOut' }}>
          
            <div className="flex items-start justify-between border-b border-border px-6 py-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">{title}</h2>
                {description && <p className="mt-1 text-sm text-muted">{description}</p>}
              </div>
              <button onClick={onClose} aria-label="Close drawer" className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-foreground">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="border-t border-border px-6 py-4">{footer}</div>}
          </motion.aside>
        </div>
      }
    </AnimatePresence>,
    document.body
  );
}