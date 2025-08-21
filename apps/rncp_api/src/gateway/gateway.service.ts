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
                    ...headers, // Forward original headers including Authorization
                },
                timeout: 30000,
            });

            // const endTime = Date.now();
            // console.log(`📨 [${requestId}] Gateway received response at ${endTime} (${endTime - startTime}ms total)`);
            console.log(
                `📨  Gateway response: STATUS ${response.status} from ${fullUrl}`,
            );
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
            if (error.response) {
                // Erreur HTTP du microservice
                throw {
                    status: error.response.status,
                    message: error.response.data?.message || error.message,
                    data: error.response.data,
                };
            } else {
                // Erreur de connectivité
                throw {
                    status: 503,
                    message: `Service ${service} unavailable`,
                    data: { error: error.message },
                };
            }
        }
    }
}
