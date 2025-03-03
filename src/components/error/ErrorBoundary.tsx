import React from "react";
import ErrorContainer from "./ErrorContainer";

type State = {
  hasError: boolean;
  errorMessage: string;
};

type Props = {
  children: React.ReactNode;
};

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error) {
    console.log(error);
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorContainer error={this.state.errorMessage}/>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
