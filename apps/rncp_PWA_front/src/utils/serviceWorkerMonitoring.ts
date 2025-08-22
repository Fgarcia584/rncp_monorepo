import { Sentry } from '../sentry';

interface SWMetrics {
    cacheHits: number;
    cacheMisses: number;
    networkRequests: number;
    offlineRequests: number;
    syncEvents: number;
    syncFailures: number;
    updateChecks: number;
    installations: number;
}

class ServiceWorkerMonitor {
    private metrics: SWMetrics = {
        cacheHits: 0,
        cacheMisses: 0,
        networkRequests: 0,
        offlineRequests: 0,
        syncEvents: 0,
        syncFailures: 0,
        updateChecks: 0,
        installations: 0
    };

    // private registration: ServiceWorkerRegistration | null = null;
    private isOnline = navigator.onLine;
    private syncQueue: unknown[] = [];

    constructor() {
        this.initializeMonitoring();
        this.setupNetworkMonitoring();
        this.setupServiceWorkerEvents();
    }

    private initializeMonitoring() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                // this.registration = registration;
                this.metrics.installations++;
                
                Sentry.addBreadcrumb({
                    category: 'pwa',
                    message: 'Service Worker ready',
                    level: 'info',
                    data: { 
                        scope: registration.scope,
                        installing: !!registration.installing,
                        waiting: !!registration.waiting,
                        active: !!registration.active
                    }
                });

                this.setupUpdateListener(registration);
                this.setupSyncMonitoring();
            }).catch((error) => {
                Sentry.captureException(error, {
                    tags: { component: 'service-worker' },
                    extra: { event: 'registration-failed' }
                });
            });
        } else {
            Sentry.addBreadcrumb({
                category: 'pwa',
                message: 'Service Worker not supported',
                level: 'warning'
            });
        }
    }

    private setupNetworkMonitoring() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            Sentry.addBreadcrumb({
                category: 'connectivity',
                message: 'Network connection restored',
                level: 'info'
            });
            this.processSyncQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            Sentry.addBreadcrumb({
                category: 'connectivity',
                message: 'Network connection lost',
                level: 'warning'
            });
        });

        // Monitor connection quality
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            if (connection) {
                const logConnection = () => {
                    Sentry.addBreadcrumb({
                        category: 'connectivity',
                        message: `Connection: ${connection.effectiveType}, ${connection.downlink}Mbps`,
                        level: 'info',
                        data: {
                            effectiveType: connection.effectiveType,
                            downlink: connection.downlink,
                            rtt: connection.rtt,
                            saveData: connection.saveData
                        }
                    });
                };

                connection.addEventListener('change', logConnection);
                logConnection(); // Initial log
            }
        }
    }

    private setupServiceWorkerEvents() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                this.handleServiceWorkerMessage(event.data);
            });

            // Listen for controller changes (updates)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                Sentry.addBreadcrumb({
                    category: 'pwa',
                    message: 'Service Worker controller changed (update applied)',
                    level: 'info'
                });
            });
        }
    }

    private setupUpdateListener(registration: ServiceWorkerRegistration) {
        registration.addEventListener('updatefound', () => {
            this.metrics.updateChecks++;
            
            Sentry.addBreadcrumb({
                category: 'pwa',
                message: 'Service Worker update found',
                level: 'info'
            });

            const newWorker = registration.installing;
            if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        Sentry.addBreadcrumb({
                            category: 'pwa',
                            message: 'New Service Worker installed, pending activation',
                            level: 'info'
                        });
                    }
                });
            }
        });
    }

    private setupSyncMonitoring() {
        // Monitor background sync if available
        if ('sync' in window.ServiceWorkerRegistration.prototype) {
            // Background sync monitoring will be handled by the service worker
            // and communicated via messages
        }

        // Monitor push notifications if available
        if ('PushManager' in window) {
            Sentry.addBreadcrumb({
                category: 'pwa',
                message: 'Push notifications supported',
                level: 'info'
            });
        }
    }

    private handleServiceWorkerMessage(data: { type: string; [key: string]: unknown }) {
        switch (data.type) {
            case 'CACHE_HIT':
                this.metrics.cacheHits++;
                break;
            case 'CACHE_MISS':
                this.metrics.cacheMisses++;
                break;
            case 'NETWORK_REQUEST':
                this.metrics.networkRequests++;
                break;
            case 'OFFLINE_REQUEST':
                this.metrics.offlineRequests++;
                this.addToSyncQueue(data.request);
                break;
            case 'SYNC_SUCCESS':
                this.metrics.syncEvents++;
                break;
            case 'SYNC_FAILURE':
                this.metrics.syncFailures++;
                Sentry.captureMessage('Background sync failed', 'warning');
                break;
            default:
                break;
        }

        // Send metrics periodically
        this.sendMetricsIfNeeded();
    }

    private addToSyncQueue(request: unknown) {
        this.syncQueue.push({
            ...(request as object),
            timestamp: Date.now()
        });

        Sentry.addBreadcrumb({
            category: 'pwa',
            message: `Request queued for sync: ${(request as any)?.method} ${(request as any)?.url}`,
            level: 'info',
            data: { queueLength: this.syncQueue.length }
        });
    }

    private processSyncQueue() {
        if (this.syncQueue.length === 0) return;

        Sentry.addBreadcrumb({
            category: 'pwa',
            message: `Processing sync queue: ${this.syncQueue.length} items`,
            level: 'info'
        });

        // In a real implementation, this would coordinate with the service worker
        // to process queued requests
        this.syncQueue = [];
    }

    private sendMetricsIfNeeded() {
        const totalEvents = Object.values(this.metrics).reduce((sum, val) => sum + val, 0);
        
        if (totalEvents % 10 === 0 && totalEvents > 0) {
            this.sendMetrics();
        }
    }

    private sendMetrics() {
        const cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) || 0;
        const syncSuccessRate = this.metrics.syncEvents / (this.metrics.syncEvents + this.metrics.syncFailures) || 0;

        Sentry.addBreadcrumb({
            category: 'pwa-metrics',
            message: `Cache hit rate: ${(cacheHitRate * 100).toFixed(1)}%, Sync success rate: ${(syncSuccessRate * 100).toFixed(1)}%`,
            level: 'info',
            data: {
                ...this.metrics,
                cacheHitRate,
                syncSuccessRate,
                isOnline: this.isOnline,
                queueLength: this.syncQueue.length
            }
        });

        // Alert on poor performance
        if (cacheHitRate < 0.5 && this.metrics.cacheHits + this.metrics.cacheMisses > 10) {
            Sentry.captureMessage('Low PWA cache hit rate', 'warning');
        }

        if (syncSuccessRate < 0.8 && this.metrics.syncEvents + this.metrics.syncFailures > 5) {
            Sentry.captureMessage('High PWA sync failure rate', 'warning');
        }
    }

    // Public methods for manual reporting
    public reportCacheEvent(type: 'hit' | 'miss', url: string) {
        if (type === 'hit') {
            this.metrics.cacheHits++;
        } else {
            this.metrics.cacheMisses++;
        }

        Sentry.addBreadcrumb({
            category: 'pwa',
            message: `Cache ${type}: ${url}`,
            level: 'debug',
            data: { type, url }
        });
    }

    public reportOfflineAction(action: string, data?: unknown) {
        this.metrics.offlineRequests++;
        
        Sentry.addBreadcrumb({
            category: 'pwa',
            message: `Offline action: ${action}`,
            level: 'info',
            data: { action, isOnline: this.isOnline, ...(data as object) }
        });
    }

    public reportInstallPrompt() {
        Sentry.addBreadcrumb({
            category: 'pwa',
            message: 'PWA install prompt shown',
            level: 'info'
        });
    }

    public reportAppInstalled() {
        Sentry.addBreadcrumb({
            category: 'pwa',
            message: 'PWA app installed',
            level: 'info'
        });
    }

    public getMetrics(): SWMetrics & { cacheHitRate: number; isOnline: boolean; queueLength: number } {
        const cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) || 0;
        
        return {
            ...this.metrics,
            cacheHitRate,
            isOnline: this.isOnline,
            queueLength: this.syncQueue.length
        };
    }

    public checkServiceWorkerHealth(): Promise<boolean> {
        return new Promise((resolve) => {
            if (!('serviceWorker' in navigator)) {
                resolve(false);
                return;
            }

            navigator.serviceWorker.ready.then((registration) => {
                const isHealthy = !!(registration.active && registration.active.state === 'activated');
                
                Sentry.addBreadcrumb({
                    category: 'pwa',
                    message: `Service Worker health check: ${isHealthy ? 'healthy' : 'unhealthy'}`,
                    level: isHealthy ? 'info' : 'warning',
                    data: {
                        scope: registration.scope,
                        activeState: registration.active?.state,
                        installingState: registration.installing?.state,
                        waitingState: registration.waiting?.state
                    }
                });

                resolve(isHealthy);
            }).catch(() => {
                resolve(false);
            });
        });
    }
}

// Export singleton instance
export const serviceWorkerMonitor = new ServiceWorkerMonitor();

// Export hook for React components
export const useServiceWorkerMonitor = () => {
    return {
        reportCacheEvent: serviceWorkerMonitor.reportCacheEvent.bind(serviceWorkerMonitor),
        reportOfflineAction: serviceWorkerMonitor.reportOfflineAction.bind(serviceWorkerMonitor),
        reportInstallPrompt: serviceWorkerMonitor.reportInstallPrompt.bind(serviceWorkerMonitor),
        reportAppInstalled: serviceWorkerMonitor.reportAppInstalled.bind(serviceWorkerMonitor),
        getMetrics: serviceWorkerMonitor.getMetrics.bind(serviceWorkerMonitor),
        checkHealth: serviceWorkerMonitor.checkServiceWorkerHealth.bind(serviceWorkerMonitor)
    };
};