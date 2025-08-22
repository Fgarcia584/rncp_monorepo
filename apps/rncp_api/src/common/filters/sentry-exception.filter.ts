import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Sentry } from '../../sentry/sentry.config';

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(SentryExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // Determine status code and error message
        let status: number;
        let message: string;
        let errorResponse: unknown;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            errorResponse = exception.getResponse();
            message =
                typeof errorResponse === 'string'
                    ? errorResponse
                    : errorResponse.message;
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            errorResponse = { message };
        }

        // Enhanced logging
        const errorInfo = {
            statusCode: status,
            message,
            path: request.url,
            method: request.method,
            timestamp: new Date().toISOString(),
            userAgent: request.headers['user-agent'],
            ip: request.ip || request.connection.remoteAddress,
        };

        // Log error
        this.logger.error(
            `${request.method} ${request.url} ${status} - ${message}`,
            exception instanceof Error ? exception.stack : 'No stack trace',
        );

        // Send to Sentry for non-client errors (5xx) and specific 4xx errors
        if (status >= 500 || this.shouldReportToSentry(status, exception)) {
            Sentry.withScope((scope) => {
                // Set request context
                scope.setContext('request', {
                    url: request.url,
                    method: request.method,
                    headers: this.sanitizeHeaders(request.headers),
                    query: request.query,
                    params: request.params,
                    ip: request.ip,
                    userAgent: request.headers['user-agent'],
                });

                // Set user context if available
                if (
                    (
                        request as unknown as {
                            user?: { id?: number; email?: string };
                        }
                    ).user
                ) {
                    const user = (
                        request as unknown as {
                            user: { id?: number; email?: string };
                        }
                    ).user;
                    scope.setUser({
                        id: user.id?.toString(),
                        email: user.email,
                    });
                }

                // Set tags
                scope.setTag('http_status', status);
                scope.setTag('http_method', request.method);
                scope.setTag('endpoint', request.route?.path || request.url);

                // Set level based on status code
                scope.setLevel(status >= 500 ? 'error' : 'warning');

                // Capture the exception
                if (exception instanceof Error) {
                    Sentry.captureException(exception);
                } else {
                    Sentry.captureMessage(
                        `HTTP ${status}: ${message}`,
                        'error',
                    );
                }
            });
        }

        // Send response
        response.status(status).json({
            ...errorResponse,
            timestamp: errorInfo.timestamp,
            path: request.url,
            ...(process.env.NODE_ENV === 'development' && {
                stack: exception instanceof Error ? exception.stack : undefined,
            }),
        });
    }

    private shouldReportToSentry(status: number, exception: unknown): boolean {
        // Report specific 4xx errors that might indicate application issues
        const reportable4xxErrors = [
            HttpStatus.UNAUTHORIZED, // 401 - might indicate auth system issues
            HttpStatus.FORBIDDEN, // 403 - might indicate permission system issues
            HttpStatus.NOT_FOUND, // 404 - only if it's an unexpected route
            HttpStatus.CONFLICT, // 409 - business logic conflicts
        ];

        if (reportable4xxErrors.includes(status)) {
            // Add logic to filter out expected 401/403/404 errors
            if (status === HttpStatus.NOT_FOUND) {
                // Only report 404s that aren't expected routes
                return !this.isExpected404(exception);
            }
            return true;
        }

        return false;
    }

    private isExpected404(exception: unknown): boolean {
        // Add logic to determine if a 404 is expected
        // For example, API endpoints that should exist
        if (exception instanceof HttpException) {
            const response = exception.getResponse() as { message?: string };
            const message = response?.message || '';

            // Don't report 404s for static files or known optional endpoints
            return (
                message.includes('Cannot GET /favicon.ico') ||
                message.includes('Cannot GET /robots.txt') ||
                message.includes('Cannot GET /sitemap.xml')
            );
        }

        return false;
    }

    private sanitizeHeaders(
        headers: Record<string, string>,
    ): Record<string, string> {
        // Remove sensitive headers before sending to Sentry
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
        const sanitized: Record<string, string> = { ...headers };

        sensitiveHeaders.forEach((header) => {
            if (sanitized[header]) {
                sanitized[header] = '[REDACTED]';
            }
        });

        return sanitized;
    }
}
