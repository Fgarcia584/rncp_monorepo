import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.development', '.env.local', '.env'],
        }),
        HttpModule,
    ],
    controllers: [GatewayController],
    providers: [GatewayService],
})
export class GatewayModule {}
