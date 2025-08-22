import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { tap } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class HeadersInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse<Response>();

        return next.handle().pipe(
            tap(() => {
                // Force correct headers for JSON response
                response.header(
                    'Content-Type',
                    'application/json; charset=utf-8',
                );
                response.header('Cache-Control', 'no-cache');

                console.log(
                    '🔧 Headers Interceptor - Forced Content-Type: application/json',
                );
                console.log(
                    '🔧 Headers Interceptor - Current headers:',
                    response.getHeaders(),
                );
            }),
        );
    }
}
