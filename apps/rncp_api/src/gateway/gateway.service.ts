import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayService {
    constructor(private readonly httpService: HttpService) {}

    private getServiceUrl(service: string): string {
        const urls = {
            auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
            users: process.env.USER_SERVICE_URL || 'http://localhost:3002',
            orders: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
            geo: process.env.GEO_SERVICE_URL || 'http://localhost:3004',
            tracking: process.env.GEO_SERVICE_URL || 'http://localhost:3004', // Tracking est dans geo service
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

        console.log(`🚀 Gateway proxying ${method.toUpperCase()} ${fullUrl}`);

        try {
            const response = await firstValueFrom(
                this.httpService.request({
                    method: method.toLowerCase(),
                    url: fullUrl,
                    data: body,
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000,
                }),
            );

            console.log(
                `✅ Gateway proxy success: ${response.status} ${fullUrl}`,
            );
            return {
                data: response.data,
                status: response.status,
                headers: response.headers,
            };
        } catch (error) {
            console.error(
                `❌ Gateway proxy error: ${error.message} - ${fullUrl}`,
            );

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
