import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = "Loading data...", className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[250px] p-8 w-full h-full bg-card rounded-xl border border-border ${className}`}>
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground font-medium text-sm animate-pulse">{message}</p>
    </div>
  );
};
