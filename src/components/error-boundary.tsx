'use client';
import { Component, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';

type ErrorBoundaryProps = {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      this.props.fallback ?? (
        <section className="panel" role="alert">
          <h2>This part of the lab could not load.</h2>
          <p>Try again, or return to the lab to open a sample exercise.</p>
          <div className="toolbar-actions mt-6">
            <Button onClick={() => this.setState({ hasError: false })}>Try again</Button>
            <Button variant="outline" asChild>
              <Link href="/">Back to the lab</Link>
            </Button>
          </div>
        </section>
      )
    );
  }
}

export function withInterpretationErrorBoundary<P extends object>(
  ComponentToWrap: React.ComponentType<P>,
  options: { fallback?: ReactNode } = {},
) {
  return function InterpretationBoundary(props: P) {
    return (
      <ErrorBoundary fallback={options.fallback}>
        <ComponentToWrap {...props} />
      </ErrorBoundary>
    );
  };
}
