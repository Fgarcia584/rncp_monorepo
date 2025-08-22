import { ErrorBoundary } from '@sentry/react';
import PropTypes from 'prop-types';

const DefaultErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto text-center">
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h1>
                <p className="text-gray-600 mb-4">
                    We&apos;re sorry for the inconvenience. The error has been automatically reported to our team.
                </p>
                <div className="space-y-2">
                    <button
                        onClick={resetError}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => (window.location.href = '/')}
                        className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Go to home page
                    </button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <details className="mt-4 text-left">
                        <summary className="cursor-pointer text-sm text-gray-500">
                            Error details (development only)
                        </summary>
                        <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                            {error.message}
                            {error.stack}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    </div>
);

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    beforeCapture?: (scope: unknown, error: Error, errorInfo: unknown) => void;
}

export const SentryErrorBoundary: React.FC<Props> = ({ children, fallback, beforeCapture }) => {
    return (
        <ErrorBoundary
            fallback={fallback || DefaultErrorFallback}
            beforeCapture={(scope, error, errorInfo) => {
                // Add additional context to Sentry
                scope.setTag('errorBoundary', 'react');
                scope.setContext('errorInfo', errorInfo);

                // Call custom beforeCapture if provided
                beforeCapture?.(scope, error, errorInfo);
            }}
        >
            {children}
        </ErrorBoundary>
    );
};

SentryErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
    fallback: PropTypes.node,
    beforeCapture: PropTypes.func,
};
