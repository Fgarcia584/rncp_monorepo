import { Sentry } from '../sentry';

interface PerformanceMetrics {
    name: string;
    value: number;
    timestamp: number;
    url?: string;
}

class PerformanceMonitor {
    private metricsBuffer: PerformanceMetrics[] = [];
    private observer: PerformanceObserver | null = null;

    constructor() {
        this.initializeObserver();
        this.measureCoreWebVitals();
    }

    private initializeObserver() {
        if ('PerformanceObserver' in window) {
            this.observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.processPerformanceEntry(entry);
                }
            });

            // Observe all performance entry types
            try {
                this.observer.observe({ 
                    entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] 
                });
            } catch (error) {
                console.warn('Performance Observer not fully supported:', error);
            }
        }
    }

    private processPerformanceEntry(entry: PerformanceEntry) {
        const metric: PerformanceMetrics = {
            name: entry.name,
            value: entry.startTime,
            timestamp: Date.now(),
            url: window.location.href
        };

        // Handle different entry types
        switch (entry.entryType) {
            case 'navigation':
                this.handleNavigationEntry(entry as PerformanceNavigationTiming);
                break;
            case 'paint':
                this.handlePaintEntry(entry);
                break;
            case 'largest-contentful-paint':
                this.handleLCPEntry(entry);
                break;
            case 'first-input':
                this.handleFIDEntry(entry);
                break;
            case 'layout-shift':
                this.handleCLSEntry(entry);
                break;
            case 'resource':
                this.handleResourceEntry(entry as PerformanceResourceTiming);
                break;
        }

        this.metricsBuffer.push(metric);
        this.sendMetricsIfBufferFull();
    }

    private handleNavigationEntry(entry: PerformanceNavigationTiming) {
        const metrics = {
            'Time to First Byte': entry.responseStart - entry.requestStart,
            'DOM Content Loaded': entry.domContentLoadedEventEnd - entry.navigationStart,
            'Load Complete': entry.loadEventEnd - entry.navigationStart,
            'DOM Interactive': entry.domInteractive - entry.navigationStart,
        };

        Object.entries(metrics).forEach(([name, value]) => {
            if (value > 0) {
                Sentry.addBreadcrumb({
                    category: 'performance',
                    message: `${name}: ${value.toFixed(2)}ms`,
                    level: 'info',
                    data: { metric: name, value, type: 'navigation' }
                });

                // Alert if performance is degraded
                if (name === 'Load Complete' && value > 5000) {
                    Sentry.captureMessage('Slow page load detected', 'warning');
                }
            }
        });
    }

    private handlePaintEntry(entry: PerformanceEntry) {
        const value = entry.startTime;
        
        Sentry.addBreadcrumb({
            category: 'performance',
            message: `${entry.name}: ${value.toFixed(2)}ms`,
            level: 'info',
            data: { metric: entry.name, value, type: 'paint' }
        });

        // First Contentful Paint threshold
        if (entry.name === 'first-contentful-paint' && value > 1800) {
            Sentry.captureMessage('Slow First Contentful Paint', 'warning');
        }
    }

    private handleLCPEntry(entry: PerformanceEntry & { startTime: number }) {
        const value = entry.startTime;
        
        Sentry.addBreadcrumb({
            category: 'performance', 
            message: `Largest Contentful Paint: ${value.toFixed(2)}ms`,
            level: 'info',
            data: { metric: 'LCP', value, type: 'core-web-vital' }
        });

        // LCP threshold (2.5s)
        if (value > 2500) {
            Sentry.captureMessage('Poor Largest Contentful Paint', 'warning');
        }
    }

    private handleFIDEntry(entry: PerformanceEntry & { processingStart: number; startTime: number }) {
        const value = entry.processingStart - entry.startTime;
        
        Sentry.addBreadcrumb({
            category: 'performance',
            message: `First Input Delay: ${value.toFixed(2)}ms`,
            level: 'info', 
            data: { metric: 'FID', value, type: 'core-web-vital' }
        });

        // FID threshold (100ms)
        if (value > 100) {
            Sentry.captureMessage('Poor First Input Delay', 'warning');
        }
    }

    private handleCLSEntry(entry: PerformanceEntry & { value: number }) {
        if (!entry.hadRecentInput) {
            const value = entry.value;
            
            Sentry.addBreadcrumb({
                category: 'performance',
                message: `Cumulative Layout Shift: ${value.toFixed(4)}`,
                level: 'info',
                data: { metric: 'CLS', value, type: 'core-web-vital' }
            });

            // CLS threshold (0.1)
            if (value > 0.1) {
                Sentry.captureMessage('Poor Cumulative Layout Shift', 'warning');
            }
        }
    }

    private handleResourceEntry(entry: PerformanceResourceTiming) {
        // Monitor slow resources
        const duration = entry.responseEnd - entry.requestStart;
        
        if (duration > 2000) { // Resources taking more than 2s
            Sentry.addBreadcrumb({
                category: 'performance',
                message: `Slow resource: ${entry.name}`,
                level: 'warning',
                data: { 
                    resource: entry.name, 
                    duration, 
                    type: 'slow-resource',
                    size: entry.transferSize 
                }
            });
        }
    }

    private measureCoreWebVitals() {
        // Web Vitals library integration if available
        if ('web-vitals' in window) {
            // This would integrate with web-vitals library
            console.log('Web Vitals library detected');
        }
    }

    private sendMetricsIfBufferFull() {
        if (this.metricsBuffer.length >= 10) {
            this.sendMetrics();
        }
    }

    private sendMetrics() {
        if (this.metricsBuffer.length === 0) return;

        // Send aggregated metrics to Sentry
        Sentry.addBreadcrumb({
            category: 'performance',
            message: `Performance metrics batch (${this.metricsBuffer.length} entries)`,
            level: 'info',
            data: { metricsCount: this.metricsBuffer.length }
        });

        this.metricsBuffer = [];
    }

    // Manual timing functions
    public startTiming(name: string): () => void {
        const startTime = performance.now();
        
        return () => {
            const duration = performance.now() - startTime;
            
            Sentry.addBreadcrumb({
                category: 'performance',
                message: `Custom timing - ${name}: ${duration.toFixed(2)}ms`,
                level: 'info',
                data: { metric: name, duration, type: 'custom' }
            });

            // Alert on slow custom operations
            if (duration > 1000) {
                Sentry.captureMessage(`Slow operation: ${name}`, 'warning');
            }
        };
    }

    // Monitor API response times
    public measureApiCall(endpoint: string, duration: number, status: number) {
        Sentry.addBreadcrumb({
            category: 'api-performance',
            message: `API call - ${endpoint}: ${duration.toFixed(2)}ms`,
            level: status >= 400 ? 'error' : 'info',
            data: { 
                endpoint, 
                duration, 
                status, 
                type: 'api-timing' 
            }
        });

        // Alert on slow API calls
        if (duration > 1000) {
            Sentry.captureMessage(`Slow API call: ${endpoint}`, 'warning');
        }
    }

    // Memory monitoring
    public checkMemoryUsage() {
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            const memoryUsage = {
                used: Math.round(memory.usedJSHeapSize / 1048576), // MB
                total: Math.round(memory.totalJSHeapSize / 1048576), // MB
                limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
            };

            Sentry.addBreadcrumb({
                category: 'performance',
                message: `Memory usage: ${memoryUsage.used}MB / ${memoryUsage.total}MB`,
                level: 'info',
                data: { ...memoryUsage, type: 'memory' }
            });

            // Alert on high memory usage (>80% of limit)
            if (memoryUsage.used > memoryUsage.limit * 0.8) {
                Sentry.captureMessage('High memory usage detected', 'warning');
            }
        }
    }

    public destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.sendMetrics(); // Send remaining metrics
    }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export hook for React components  
export const usePerformanceMonitor = () => {
    return {
        startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
        measureApiCall: performanceMonitor.measureApiCall.bind(performanceMonitor),
        checkMemoryUsage: performanceMonitor.checkMemoryUsage.bind(performanceMonitor)
    };
};