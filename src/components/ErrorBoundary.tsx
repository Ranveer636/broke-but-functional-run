import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ errorInfo: info });
    this.props.onError?.(error, info);
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-destructive bg-destructive/10 p-6 text-center"
        >
          <h2 className="text-lg font-semibold text-destructive">
            Something went wrong
          </h2>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <pre className="max-w-full overflow-auto rounded bg-muted p-2 text-xs text-muted-foreground">
              {this.state.error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Retry loading the application"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
