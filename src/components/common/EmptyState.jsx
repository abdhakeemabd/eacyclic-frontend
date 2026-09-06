import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({ 
  icon = <PackageOpen className="h-16 w-16 text-muted-foreground opacity-30" />,
  title = "No Data Found",
  description = "There is currently no data to display here.",
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center bg-card rounded-xl border border-border shadow-sm w-full">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6 text-sm leading-relaxed">{description}</p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};
