import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message ?? 'Unknown error' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('lofi.dev caught error:', error, info.componentStack);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: '#0a0a14' }}
      >
        {/* Background orbs */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 50% 50% at 20% 30%, rgba(139,92,246,0.25) 0%, transparent 70%),
              radial-gradient(ellipse 40% 40% at 80% 70%, rgba(219,39,119,0.18) 0%, transparent 70%)
            `,
          }}
        />

        <div
          className="relative z-10 flex flex-col items-center gap-6 max-w-md mx-4 text-center px-8 py-10 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="text-4xl select-none">🎵</div>

          <div>
            <h1
              className="text-lg font-semibold mb-2"
              style={{ color: 'rgba(240,234,248,0.9)' }}
            >
              Something went wrong
            </h1>
            <p className="text-sm" style={{ color: 'rgba(240,234,248,0.45)' }}>
              {this.state.errorMessage}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:opacity-90 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(240,234,248,0.8)',
              }}
            >
              Try again
            </button>

            <button
              onClick={this.handleRefresh}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:opacity-90 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.8), rgba(219,39,119,0.6))',
                color: 'white',
              }}
            >
              Refresh page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
