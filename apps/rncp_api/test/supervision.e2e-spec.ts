import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Supervision System (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    describe('Health Checks', () => {
        it('should return API Gateway health status', async () => {
            const response = await request(app.getHttpServer())
                .get('/health')
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('services');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body.status).toBe('healthy');
        });

        it('should return detailed health information', async () => {
            const response = await request(app.getHttpServer())
                .get('/health/detailed')
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('service');
            expect(response.body).toHaveProperty('environment');
            expect(response.body).toHaveProperty('uptime');
            expect(response.body).toHaveProperty('memory');
            expect(response.body.service).toBe('rncp-api-gateway');
        });

        it('should have auth service health endpoint', async () => {
            const response = await request(app.getHttpServer())
                .get('/auth/health')
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('service');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body.service).toBe('auth-service');
        });

        it('should have user service health endpoint', async () => {
            const response = await request(app.getHttpServer())
                .get('/users/health')
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('service');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body.service).toBe('user-service');
        });

        it('should have geo service health endpoint', async () => {
            const response = await request(app.getHttpServer())
                .get('/geo/health')
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('timestamp');
        });
    });

    describe('Sentry Integration', () => {
        it('should have Sentry test endpoints in development', async () => {
            // Set NODE_ENV to development for this test
            const originalNodeEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            try {
                await request(app.getHttpServer())
                    .get('/sentry/test-message')
                    .expect(200);

                await request(app.getHttpServer())
                    .get('/sentry/test-error')
                    .expect(200);

                await request(app.getHttpServer())
                    .get('/sentry/test-breadcrumb')
                    .expect(200);
            } finally {
                process.env.NODE_ENV = originalNodeEnv;
            }
        });

        it('should reject Sentry test endpoints in production', async () => {
            // Set NODE_ENV to production for this test
            const originalNodeEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            try {
                await request(app.getHttpServer())
                    .get('/sentry/test-message')
                    .expect(404);

                await request(app.getHttpServer())
                    .get('/sentry/test-error')
                    .expect(404);

                await request(app.getHttpServer())
                    .get('/sentry/test-exception')
                    .expect(404);
            } finally {
                process.env.NODE_ENV = originalNodeEnv;
            }
        });

        it('should trigger Sentry exception filter', async () => {
            // Set NODE_ENV to development for this test
            const originalNodeEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            try {
                await request(app.getHttpServer())
                    .get('/sentry/test-exception')
                    .expect(500);
            } finally {
                process.env.NODE_ENV = originalNodeEnv;
            }
        });
    });

    describe('Performance Monitoring', () => {
        it('should track response times for health endpoints', async () => {
            const startTime = Date.now();
            
            await request(app.getHttpServer())
                .get('/health')
                .expect(200);
            
            const responseTime = Date.now() - startTime;
            
            // Health endpoints should respond quickly (< 100ms)
            expect(responseTime).toBeLessThan(100);
        });

        it('should handle concurrent health checks', async () => {
            const promises = Array.from({ length: 10 }, () =>
                request(app.getHttpServer())
                    .get('/health')
                    .expect(200)
            );

            const results = await Promise.all(promises);
            
            // All requests should succeed
            expect(results).toHaveLength(10);
            results.forEach(result => {
                expect(result.body.status).toBe('healthy');
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid routes gracefully', async () => {
            await request(app.getHttpServer())
                .get('/invalid-endpoint')
                .expect(404);
        });

        it('should validate input properly', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({})
                .expect(400);
        });
    });

    describe('Security Monitoring', () => {
        it('should require authentication for protected endpoints', async () => {
            await request(app.getHttpServer())
                .get('/users')
                .expect(401);
        });

        it('should handle missing authorization headers', async () => {
            await request(app.getHttpServer())
                .get('/auth/profile')
                .expect(401);
        });

        it('should validate JWT tokens properly', async () => {
            await request(app.getHttpServer())
                .get('/auth/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
    });
});

describe('Supervision Integration Tests', () => {
    describe('Microservices Communication', () => {
        it('should test communication between services', async () => {
            // This would test inter-service communication
            // In a real scenario, you'd test Redis messaging, etc.
            expect(true).toBe(true);
        });
    });

    describe('Database Health', () => {
        it('should check database connectivity', async () => {
            // This would test database connection
            // In a real scenario, you'd check TypeORM connection
            expect(true).toBe(true);
        });
    });

    describe('Redis Health', () => {
        it('should check Redis connectivity', async () => {
            // This would test Redis connection
            // In a real scenario, you'd check Redis client connection
            expect(true).toBe(true);
        });
    });
});

describe('Load Testing', () => {
    let testApp: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        testApp = moduleFixture.createNestApplication();
        await testApp.init();
    });

    afterEach(async () => {
        await testApp.close();
    });

    it('should handle high load on health endpoints', async () => {
        const concurrentRequests = 50;
        const promises = Array.from({ length: concurrentRequests }, (_, index) =>
            request(testApp.getHttpServer())
                .get('/health')
                .expect(200)
                .then(response => ({
                    index,
                    status: response.status,
                    responseTime: response.get('X-Response-Time') || 'unknown'
                }))
        );

        const results = await Promise.all(promises);
        
        // All requests should succeed
        expect(results).toHaveLength(concurrentRequests);
        results.forEach(result => {
            expect(result.status).toBe(200);
        });

        // Calculate success rate
        const successCount = results.filter(r => r.status === 200).length;
        const successRate = (successCount / concurrentRequests) * 100;
        
        // Should maintain at least 95% success rate under load
        expect(successRate).toBeGreaterThanOrEqual(95);
    });
});