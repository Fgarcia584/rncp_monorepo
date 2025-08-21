import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { tap } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class ResponseLoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        const { method, url } = request;

        console.log(`🔄 Interceptor - Before: ${method} ${url}`);

        return next.handle().pipe(
            tap({
                next: (data) => {
                    console.log(`📡 Interceptor - Response data:`, data);
                    console.log(
                        `📡 Interceptor - Response status code:`,
                        response.statusCode,
                    );
                    console.log(
                        `📡 Interceptor - Response headers:`,
                        response.getHeaders(),
                    );
                },
                error: (error) => {
                    console.error(`❌ Interceptor - Error:`, error);
                    console.log(
                        `❌ Interceptor - Error status code:`,
                        response.statusCode,
                    );
                },
                finalize: () => {
                    console.log(
                        `✅ Interceptor - Finalized: ${method} ${url} - Status: ${response.statusCode}`,
                    );
                },
            }),
        );
    }
}
