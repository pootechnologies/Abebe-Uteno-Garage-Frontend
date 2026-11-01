import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, info: ErrorInfo) => ReactNode);
}

interface State {
  hasError: boolean;
  error: Error | null;
  info: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    info: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ info });
    console.error("ErrorBoundary caught an error:", error, info);
    // You could also log this error to an external service here
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state if children changed
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false, error: null, info: null });
    }
  }

  render() {
    const { hasError, error, info } = this.state;
    const { fallback, children } = this.props;

    if (hasError && error) {
      if (typeof fallback === "function") {
        return fallback(error, info as ErrorInfo);
      }
      if (fallback) {
        return fallback;
      }
      // Default fallback UI
      return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Something went wrong.</h2>
          <pre style={{ color: "red" }}>{error.message}</pre>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
