import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { Sentry } from '../../sentry/sentry.config';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<unknown> {
        const request = context.switchToHttp().getRequest<Request>();
        const { method, url, headers } = request;

        // Add breadcrumb for request tracking
        Sentry.addBreadcrumb({
            category: 'http.request',
            message: `${method} ${url}`,
            level: 'info',
            data: {
                method,
                url,
                headers: this.sanitizeHeaders(
                    headers as Record<string, string | string[]>,
                ),
            },
        });

        // Set user context if available
        if (
            (request as unknown as { user?: { id?: number; email?: string } })
                .user
        ) {
            const user = (
                request as unknown as { user: { id?: number; email?: string } }
            ).user;
            Sentry.setUser({
                id: user.id?.toString(),
                email: user.email,
            });
        }

        const startTime = Date.now();

        return next.handle().pipe(
            tap(() => {
                // On successful completion
                const duration = Date.now() - startTime;

                // Add breadcrumb for successful requests
                Sentry.addBreadcrumb({
                    category: 'http.response',
                    message: `${method} ${url} - Success`,
                    level: 'info',
                    data: {
                        method,
                        url,
                        duration_ms: duration,
                        status: 'success',
                    },
                });
            }),
            catchError((error) => {
                // On error
                const duration = Date.now() - startTime;

                // Add breadcrumb for failed requests
                Sentry.addBreadcrumb({
                    category: 'http.response',
                    message: `${method} ${url} - Error`,
                    level: 'error',
                    data: {
                        method,
                        url,
                        duration_ms: duration,
                        status: 'error',
                    },
                });

                throw error;
            }),
        );
    }

    private sanitizeHeaders(
        headers: Record<string, string | string[]>,
    ): Record<string, string | string[]> {
        // Remove sensitive headers
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
        const sanitized: Record<string, string | string[]> = { ...headers };

        sensitiveHeaders.forEach((header) => {
            if (sanitized[header]) {
                sanitized[header] = '[REDACTED]';
            }
        });

        return sanitized;
    }
}
