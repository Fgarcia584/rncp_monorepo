import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { HeadersInterceptor } from './headers.interceptor';
import { of } from 'rxjs';

describe('HeadersInterceptor', () => {
    let interceptor: HeadersInterceptor;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [HeadersInterceptor],
        }).compile();

        interceptor = module.get<HeadersInterceptor>(HeadersInterceptor);
    });

    it('should be defined', () => {
        expect(interceptor).toBeDefined();
    });

    describe('intercept', () => {
        it('should set Content-Type and Cache-Control headers', (done) => {
            const mockResponse = {
                header: jest.fn(),
                getHeaders: jest.fn().mockReturnValue({}),
            };

            const mockContext = {
                switchToHttp: () => ({
                    getResponse: () => mockResponse,
                }),
            } as ExecutionContext;

            const mockCallHandler = {
                handle: () => of({ data: 'test' }),
            } as CallHandler;

            interceptor
                .intercept(mockContext, mockCallHandler)
                .subscribe((result) => {
                    expect(mockResponse.header).toHaveBeenCalledWith(
                        'Content-Type',
                        'application/json; charset=utf-8',
                    );
                    expect(mockResponse.header).toHaveBeenCalledWith(
                        'Cache-Control',
                        'no-cache',
                    );
                    expect(mockResponse.getHeaders).toHaveBeenCalled();
                    expect(result).toEqual({ data: 'test' });
                    done();
                });
        });

        it('should handle console logging', (done) => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            const mockResponse = {
                header: jest.fn(),
                getHeaders: jest.fn().mockReturnValue({
                    'Content-Type': 'application/json; charset=utf-8',
                }),
            };

            const mockContext = {
                switchToHttp: () => ({
                    getResponse: () => mockResponse,
                }),
            } as ExecutionContext;

            const mockCallHandler = {
                handle: () => of({ data: 'test' }),
            } as CallHandler;

            interceptor
                .intercept(mockContext, mockCallHandler)
                .subscribe((result) => {
                    expect(consoleSpy).toHaveBeenCalledWith(
                        '🔧 Headers Interceptor - Forced Content-Type: application/json',
                    );
                    expect(consoleSpy).toHaveBeenCalledWith(
                        '🔧 Headers Interceptor - Current headers:',
                        { 'Content-Type': 'application/json; charset=utf-8' },
                    );
                    expect(result).toEqual({ data: 'test' });
                    consoleSpy.mockRestore();
                    done();
                });
        });

        it('should pass through the original response data', (done) => {
            const originalData = {
                id: 1,
                name: 'Test Order',
                status: 'pending',
            };

            const mockResponse = {
                header: jest.fn(),
                getHeaders: jest.fn().mockReturnValue({}),
            };

            const mockContext = {
                switchToHttp: () => ({
                    getResponse: () => mockResponse,
                }),
            } as ExecutionContext;

            const mockCallHandler = {
                handle: () => of(originalData),
            } as CallHandler;

            interceptor
                .intercept(mockContext, mockCallHandler)
                .subscribe((result) => {
                    expect(result).toEqual(originalData);
                    done();
                });
        });

        it('should handle errors from the handler', (done) => {
            const error = new Error('Test error');

            const mockResponse = {
                header: jest.fn(),
                getHeaders: jest.fn().mockReturnValue({}),
            };

            const mockContext = {
                switchToHttp: () => ({
                    getResponse: () => mockResponse,
                }),
            } as ExecutionContext;

            const mockCallHandler = {
                handle: () => {
                    throw error;
                },
            } as CallHandler;

            try {
                interceptor.intercept(mockContext, mockCallHandler);
            } catch (err) {
                expect(err).toBe(error);
                done();
            }
        });
    });
});
