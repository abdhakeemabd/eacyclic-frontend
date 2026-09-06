import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center bg-destructive/5 rounded-xl border border-destructive/20 w-full h-full">
          <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Something went wrong</h3>
          <p className="text-muted-foreground text-sm max-w-md mb-6 leading-relaxed">
            {this.state.error?.message || "An unexpected error occurred while rendering this component."}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <RefreshCw size={16} className="mr-2" />
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}
