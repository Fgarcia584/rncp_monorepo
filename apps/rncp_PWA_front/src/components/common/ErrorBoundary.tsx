import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error details
        console.error('ErrorBoundary caught an error:', error);
        console.error('Error details:', errorInfo);

        this.setState({
            error,
            errorInfo,
        });

        // Call optional error handler
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI or default error UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="error-boundary p-6 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Erreur de Composant</h3>
                        </div>
                    </div>

                    <div className="text-sm text-red-700 mb-4">
                        Une erreur s&apos;est produite lors du rendu de ce composant.
                    </div>

                    {this.state.error && (
                        <details className="text-xs text-red-600 mb-4">
                            <summary className="cursor-pointer font-medium">
                                Détails de l&apos;erreur (cliquer pour voir)
                            </summary>
                            <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto">
                                <strong>Erreur:</strong> {this.state.error.message}
                                {this.state.error.stack && (
                                    <>
                                        <br />
                                        <strong>Stack trace:</strong>
                                        <br />
                                        {this.state.error.stack}
                                    </>
                                )}
                            </pre>
                        </details>
                    )}

                    <button
                        onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Réessayer
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
