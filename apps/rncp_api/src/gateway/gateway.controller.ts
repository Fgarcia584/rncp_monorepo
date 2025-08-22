import { Controller, All, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
    constructor(private readonly gatewayService: GatewayService) {}

    @Get('health')
    getHealth() {
        return { 
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'rncp-api-gateway',
            environment: process.env.NODE_ENV || 'development'
        };
    }

    @All('auth/*')
    async proxyAuth(@Req() req: Request, @Res() res: Response) {
        return this.proxyToService('auth', req, res);
    }

    @All('users/*')
    async proxyUsers(@Req() req: Request, @Res() res: Response) {
        return this.proxyToService('users', req, res);
    }

    @All('orders/*')
    async proxyOrders(@Req() req: Request, @Res() res: Response) {
        return this.proxyToService('orders', req, res);
    }

    @All('geo/*')
    async proxyGeo(@Req() req: Request, @Res() res: Response) {
        return this.proxyToService('geo', req, res);
    }

    @All('tracking/*')
    async proxyTracking(@Req() req: Request, @Res() res: Response) {
        return this.proxyToService('tracking', req, res);
    }

    private async proxyToService(service: string, req: Request, res: Response) {
        try {
            const result = await this.gatewayService.proxyRequest(
                service,
                req.method,
                req.url,
                req.body,
                req.headers,
            );

            // Copier les headers de réponse pertinents
            Object.keys(result.headers).forEach((key) => {
                if (
                    ![
                        'content-encoding',
                        'transfer-encoding',
                        'connection',
                    ].includes(key.toLowerCase())
                ) {
                    res.setHeader(key, result.headers[key]);
                }
            });

            res.status(result.status).json(result.data);
        } catch (error) {
            console.error(`Gateway error for ${service}:`, error);

            const status = error.status || 500;
            const message = error.message || 'Internal gateway error';
            const data = error.data || { error: message };

            res.status(status).json(data);
        }
    }
}
