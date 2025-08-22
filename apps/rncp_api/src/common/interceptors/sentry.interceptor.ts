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

        // Start a new transaction for performance monitoring
        const transaction = Sentry.startTransaction({
            name: `${method} ${url}`,
            op: 'http.server',
        });

        // Set transaction context
        transaction.setTag('http.method', method);
        transaction.setTag('http.url', url);
        transaction.setData(
            'http.request.headers',
            this.sanitizeHeaders(headers as Record<string, string | string[]>),
        );

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
                transaction.setTag('http.status', '2xx');
                transaction.setData('http.response.duration_ms', duration);

                // Add breadcrumb for successful requests
                Sentry.addBreadcrumb({
                    category: 'http',
                    message: `${method} ${url}`,
                    level: 'info',
                    data: {
                        method,
                        url,
                        duration_ms: duration,
                    },
                });

                transaction.finish();
            }),
            catchError((error) => {
                // On error
                const duration = Date.now() - startTime;
                transaction.setTag('http.status', 'error');
                transaction.setData('http.response.duration_ms', duration);

                // The error will be handled by the exception filter
                // Just finish the transaction here
                transaction.finish();

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
