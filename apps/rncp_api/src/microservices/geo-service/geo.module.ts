import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeoService } from './geo.service';
import { GeoController } from './geo.controller';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';

@Module({
    imports: [ConfigModule],
    controllers: [GeoController, TrackingController],
    providers: [GeoService, TrackingService],
    exports: [GeoService, TrackingService],
})
export class GeoModule {}
