import { useState } from 'react';
import { Sentry } from '../../sentry';

/**
 * Component for testing Sentry integration in development
 * Only renders in development mode
 */
export const SentryTestComponent = () => {
    const [testResults, setTestResults] = useState<string[]>([]);

    // Only show in development
    if (import.meta.env.MODE === 'production') {
        return null;
    }

    const addResult = (message: string) => {
        setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const testSentryCapture = () => {
        try {
            Sentry.captureMessage('Test message from React component', 'info');
            addResult('✅ Sentry message captured successfully');
        } catch {
            addResult('❌ Failed to capture Sentry message');
        }
    };

    const testSentryError = () => {
        try {
            Sentry.captureException(new Error('Test error from React component'));
            addResult('✅ Sentry error captured successfully');
        } catch {
            addResult('❌ Failed to capture Sentry error');
        }
    };

    const testJavaScriptError = () => {
        try {
            // This will throw an error and should be caught by our error boundary
            throw new Error('Test JavaScript error for Sentry');
        } catch (error) {
            addResult('❌ JavaScript error thrown (should be caught by error boundary)');
            throw error; // Re-throw to trigger error boundary
        }
    };

    const testAsyncError = async () => {
        try {
            // Simulate an async error
            await new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Test async error')), 100);
            });
        } catch (error) {
            Sentry.captureException(error);
            addResult('✅ Async error captured');
        }
    };

    const testBreadcrumb = () => {
        try {
            Sentry.addBreadcrumb({
                message: 'Test breadcrumb from React component',
                level: 'info',
                category: 'test',
            });
            addResult('✅ Breadcrumb added successfully');
        } catch {
            addResult('❌ Failed to add breadcrumb');
        }
    };

    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md z-50 border">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800">🐛 Sentry Test Panel</h3>
                <span className="text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded">DEV ONLY</span>
            </div>

            <div className="space-y-2 mb-3">
                <button
                    onClick={testSentryCapture}
                    className="w-full text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                    Test Message Capture
                </button>

                <button
                    onClick={testSentryError}
                    className="w-full text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
                >
                    Test Error Capture
                </button>

                <button
                    onClick={testJavaScriptError}
                    className="w-full text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                    Test JS Error (Error Boundary)
                </button>

                <button
                    onClick={testAsyncError}
                    className="w-full text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                >
                    Test Async Error
                </button>

                <button
                    onClick={testBreadcrumb}
                    className="w-full text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                >
                    Test Breadcrumb
                </button>
            </div>

            <div className="border-t pt-2">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-medium text-gray-700">Results:</h4>
                    <button onClick={clearResults} className="text-xs text-gray-500 hover:text-gray-700">
                        Clear
                    </button>
                </div>

                <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                    {testResults.length === 0 ? (
                        <p className="text-gray-500 italic">No tests run yet</p>
                    ) : (
                        testResults.map((result, index) => (
                            <div
                                key={index}
                                className={`p-1 rounded text-xs ${
                                    result.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                                }`}
                            >
                                {result}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
