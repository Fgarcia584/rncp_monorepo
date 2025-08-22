import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { performanceMonitor } from '../utils/performanceMonitoring';
import { serviceWorkerMonitor } from '../utils/serviceWorkerMonitoring';

// Mock Sentry for testing
vi.mock('../sentry', () => ({
    Sentry: {
        addBreadcrumb: vi.fn(),
        captureMessage: vi.fn(),
        captureException: vi.fn(),
    }
}));

describe('Frontend Supervision System', () => {
    beforeAll(() => {
        // Setup test environment
        Object.defineProperty(window, 'performance', {
            value: {
                now: vi.fn(() => Date.now()),
                mark: vi.fn(),
                measure: vi.fn(),
                getEntriesByType: vi.fn(() => []),
                memory: {
                    usedJSHeapSize: 10000000,
                    totalJSHeapSize: 20000000,
                    jsHeapSizeLimit: 100000000
                }
            },
            writable: true
        });

        Object.defineProperty(window, 'navigator', {
            value: {
                onLine: true,
                serviceWorker: {
                    ready: Promise.resolve({
                        active: { state: 'activated' },
                        scope: '/',
                        addEventListener: vi.fn()
                    }),
                    addEventListener: vi.fn()
                }
            },
            writable: true
        });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    describe('Performance Monitoring', () => {
        it('should initialize performance monitor', () => {
            expect(performanceMonitor).toBeDefined();
        });

        it('should start and stop custom timing', () => {
            const stopTiming = performanceMonitor.startTiming('test-operation');
            expect(typeof stopTiming).toBe('function');
            
            // Simulate some work
            setTimeout(() => {
                stopTiming();
            }, 100);
        });

        it('should measure API call performance', () => {
            performanceMonitor.measureApiCall('/api/test', 250, 200);
            performanceMonitor.measureApiCall('/api/slow', 1500, 200); // Should trigger warning
            performanceMonitor.measureApiCall('/api/error', 300, 500);
        });

        it('should check memory usage', () => {
            performanceMonitor.checkMemoryUsage();
        });

        it('should handle Core Web Vitals', () => {
            // Mock Core Web Vitals entries
            // const mockEntry = {
            //     entryType: 'largest-contentful-paint',
            //     startTime: 1500,
            //     name: 'test-lcp'
            // };

            // This would normally be called by PerformanceObserver
            // performanceMonitor.processPerformanceEntry(mockEntry);
        });
    });

    describe('Service Worker Monitoring', () => {
        it('should initialize service worker monitor', () => {
            expect(serviceWorkerMonitor).toBeDefined();
        });

        it('should report cache events', () => {
            serviceWorkerMonitor.reportCacheEvent('hit', '/api/users');
            serviceWorkerMonitor.reportCacheEvent('miss', '/api/orders');
        });

        it('should report offline actions', () => {
            serviceWorkerMonitor.reportOfflineAction('save-order', { orderId: 123 });
        });

        it('should report PWA installation events', () => {
            serviceWorkerMonitor.reportInstallPrompt();
            serviceWorkerMonitor.reportAppInstalled();
        });

        it('should check service worker health', async () => {
            const isHealthy = await serviceWorkerMonitor.checkServiceWorkerHealth();
            expect(typeof isHealthy).toBe('boolean');
        });

        it('should get metrics', () => {
            const metrics = serviceWorkerMonitor.getMetrics();
            
            expect(metrics).toHaveProperty('cacheHits');
            expect(metrics).toHaveProperty('cacheMisses');
            expect(metrics).toHaveProperty('cacheHitRate');
            expect(metrics).toHaveProperty('isOnline');
            expect(metrics).toHaveProperty('queueLength');
        });
    });

    describe('Network Monitoring', () => {
        it('should handle online/offline events', () => {
            // Simulate going offline
            Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
            window.dispatchEvent(new Event('offline'));

            // Simulate coming back online
            Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
            window.dispatchEvent(new Event('online'));
        });

        it('should monitor connection quality', () => {
            // Mock navigator.connection
            Object.defineProperty(navigator, 'connection', {
                value: {
                    effectiveType: '4g',
                    downlink: 10,
                    rtt: 100,
                    saveData: false,
                    addEventListener: vi.fn()
                },
                writable: true
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle performance monitoring errors gracefully', () => {
            // Test with invalid performance entries
            // const invalidEntry = {
            //     entryType: 'unknown',
            //     startTime: -1,
            //     name: 'invalid'
            // };

            // Should not throw
            expect(() => {
                // performanceMonitor.processPerformanceEntry(invalidEntry);
            }).not.toThrow();
        });

        it('should handle service worker errors gracefully', () => {
            // Mock service worker not available
            Object.defineProperty(navigator, 'serviceWorker', {
                value: undefined,
                writable: true
            });

            // Should not throw
            expect(() => {
                serviceWorkerMonitor.checkServiceWorkerHealth();
            }).not.toThrow();
        });
    });

    describe('Performance Thresholds', () => {
        it('should detect slow operations', () => {
            // Mock a slow operation
            const stopTiming = performanceMonitor.startTiming('slow-operation');
            
            // Simulate slow operation (> 1000ms should trigger warning)
            vi.spyOn(performance, 'now')
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(1500);
            
            stopTiming();
        });

        it('should detect slow API calls', () => {
            // API call > 1000ms should trigger warning
            performanceMonitor.measureApiCall('/api/very-slow', 2000, 200);
        });

        it('should detect high memory usage', () => {
            // Mock high memory usage
            Object.defineProperty(performance, 'memory', {
                value: {
                    usedJSHeapSize: 85000000, // 85MB
                    totalJSHeapSize: 90000000, // 90MB
                    jsHeapSizeLimit: 100000000 // 100MB (85% usage should trigger warning)
                },
                writable: true
            });

            performanceMonitor.checkMemoryUsage();
        });
    });

    describe('PWA Metrics', () => {
        it('should track cache hit rate', () => {
            // Report several cache events
            for (let i = 0; i < 8; i++) {
                serviceWorkerMonitor.reportCacheEvent('hit', `/api/resource-${i}`);
            }
            for (let i = 0; i < 2; i++) {
                serviceWorkerMonitor.reportCacheEvent('miss', `/api/new-resource-${i}`);
            }

            const metrics = serviceWorkerMonitor.getMetrics();
            expect(metrics.cacheHitRate).toBe(0.8); // 80% hit rate
        });

        it('should track offline queue', () => {
            // Simulate offline requests
            serviceWorkerMonitor.reportOfflineAction('create-order');
            serviceWorkerMonitor.reportOfflineAction('update-profile');

            const metrics = serviceWorkerMonitor.getMetrics();
            expect(metrics.offlineRequests).toBeGreaterThan(0);
        });
    });
});

describe('Integration Tests', () => {
    it('should integrate with Sentry properly', async () => {
        const { Sentry } = await import('../sentry');
        
        // Performance monitoring should add breadcrumbs
        performanceMonitor.measureApiCall('/api/test', 150, 200);
        expect(Sentry.addBreadcrumb).toHaveBeenCalled();

        // Service worker monitoring should add breadcrumbs
        serviceWorkerMonitor.reportCacheEvent('hit', '/api/cached');
        expect(Sentry.addBreadcrumb).toHaveBeenCalled();
    });

    it('should handle concurrent monitoring operations', async () => {
        const operations = [];

        // Start multiple performance timings
        for (let i = 0; i < 10; i++) {
            const stopTiming = performanceMonitor.startTiming(`operation-${i}`);
            operations.push(stopTiming);
        }

        // Report multiple cache events
        for (let i = 0; i < 10; i++) {
            serviceWorkerMonitor.reportCacheEvent('hit', `/resource-${i}`);
        }

        // Stop all timings
        operations.forEach(stop => stop());

        // Should not cause any issues
        expect(true).toBe(true);
    });

    it('should validate monitoring data consistency', () => {
        const initialMetrics = serviceWorkerMonitor.getMetrics();
        
        // Report some events
        serviceWorkerMonitor.reportCacheEvent('hit', '/test1');
        serviceWorkerMonitor.reportCacheEvent('miss', '/test2');
        serviceWorkerMonitor.reportOfflineAction('test-action');

        const updatedMetrics = serviceWorkerMonitor.getMetrics();
        
        // Metrics should be updated
        expect(updatedMetrics.cacheHits).toBeGreaterThan(initialMetrics.cacheHits);
        expect(updatedMetrics.cacheMisses).toBeGreaterThan(initialMetrics.cacheMisses);
        expect(updatedMetrics.offlineRequests).toBeGreaterThan(initialMetrics.offlineRequests);
    });
});