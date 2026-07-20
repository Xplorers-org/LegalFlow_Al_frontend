


import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumbs &&
        <nav className="mb-2 flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
            {breadcrumbs.map((c, i) =>
          <React.Fragment key={i}>
                {c.to ?
            <Link to={c.to} className="transition-colors hover:text-foreground">
                    {c.label}
                  </Link> :

            <span className="font-medium text-foreground">{c.label}</span>
            }
                {i < breadcrumbs.length - 1 && <ChevronRightIcon className="h-3.5 w-3.5" />}
              </React.Fragment>
          )}
          </nav>
        }
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>);

}