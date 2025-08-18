import React from 'react';

type State = { hasError: boolean; error?: Error | null };

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <div className="rounded-xl border p-6 bg-red-50 text-red-800">
            <div className="font-semibold mb-1">Something went wrong</div>
            <div className="text-sm opacity-80">{this.state.error?.message ?? 'Unknown error'}</div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
