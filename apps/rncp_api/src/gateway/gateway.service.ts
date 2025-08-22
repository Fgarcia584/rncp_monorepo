import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GatewayService {
    constructor() {}

    private getServiceUrl(service: string): string {
        // En mode Docker, utiliser les noms de conteneur avec le port interne standard
        const isDocker =
            process.env.NODE_ENV === 'production' || !!process.env.DOCKER_ENV;

        const urls = isDocker
            ? {
                  auth: 'http://rncp-auth-service:3001',
                  users: 'http://rncp-user-service:3001',
                  orders: 'http://rncp-order-service:3001',
                  geo: 'http://rncp-geo-service:3001',
                  tracking: 'http://rncp-geo-service:3001',
              }
            : {
                  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
                  users:
                      process.env.USER_SERVICE_URL || 'http://localhost:3002',
                  orders:
                      process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
                  geo: process.env.GEO_SERVICE_URL || 'http://localhost:3004',
                  tracking:
                      process.env.GEO_SERVICE_URL || 'http://localhost:3004',
              };

        return urls[service] || urls.auth;
    }

    async proxyRequest(
        service: string,
        method: string,
        path: string,
        body?,
        headers?,
    ): Promise<{ data; status: number; headers }> {
        const serviceUrl = this.getServiceUrl(service);
        const fullUrl = `${serviceUrl}${path}`;

        try {
            const response = await axios({
                method: method.toLowerCase(),
                url: fullUrl,
                data: body,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Internal-Service': 'gateway',
                    // Forward only essential headers to avoid conflicts
                    ...(headers.authorization && {
                        Authorization: headers.authorization,
                    }),
                    ...(headers.accept && { Accept: headers.accept }),
                    ...(headers['accept-language'] && {
                        'Accept-Language': headers['accept-language'],
                    }),
                    ...(headers['user-agent'] && {
                        'User-Agent': headers['user-agent'],
                    }),
                    // Don't forward problematic headers like host, content-length, connection, etc.
                },
                timeout: 30000,
            });

            // console.log(`📤 [${requestId}] Response headers:`, response.headers);
            // console.log(`📤 [${requestId}] Response data type:`, typeof response.data);
            // console.log(`📤 [${requestId}] Response data length:`, response.data ? JSON.stringify(response.data).length : 'null');

            // try {
            //     console.log(`📤 [${requestId}] Response data:`, JSON.stringify(response.data, null, 2));
            // } catch (jsonError) {
            //     console.log(`❌ [${requestId}] Cannot JSON stringify response data:`, jsonError);
            //     console.log(`📤 [${requestId}] Raw response data:`, response.data);
            // }

            // if (response.status >= 200 && response.status < 300) {
            //     console.log(`✅ [${requestId}] Gateway proxy success: ${response.status} ${fullUrl}`);
            // } else {
            //     console.log(`⚠️ [${requestId}] Gateway proxy non-2xx status: ${response.status} ${fullUrl}`);
            // }

            return {
                data: response.data,
                status: response.status,
                headers: response.headers,
            };
        } catch (error) {
            console.error(`Gateway service error for ${service}:`, {
                url: fullUrl,
                method: method,
                errorType: error.code || 'unknown',
                message: error.message,
            });

            if (error.response) {
                // Erreur HTTP du microservice - propager exactement la réponse
                throw {
                    status: error.response.status,
                    message: error.response.data?.message || error.message,
                    data: error.response.data,
                };
            } else if (
                error.code === 'ECONNREFUSED' ||
                error.code === 'ENOTFOUND'
            ) {
                // Erreur de connectivité spécifique
                throw {
                    status: 503,
                    message: `Service ${service} unavailable`,
                    data: {
                        error: `Cannot connect to ${service} service`,
                        code: error.code,
                    },
                };
            } else if (error.code === 'ECONNABORTED') {
                // Timeout
                throw {
                    status: 504,
                    message: `Service ${service} timeout`,
                    data: {
                        error: `Request to ${service} service timed out`,
                        timeout: 30000,
                    },
                };
            } else {
                // Autres erreurs
                throw {
                    status: 502,
                    message: `Gateway error communicating with ${service}`,
                    data: { error: error.message, code: error.code },
                };
            }
        }
    }
}
