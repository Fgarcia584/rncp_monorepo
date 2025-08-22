import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeoService } from './geo.service';

describe('GeoService', () => {
    let service: GeoService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GeoService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('test-api-key'),
                    },
                },
            ],
        }).compile();

        service = module.get<GeoService>(GeoService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('constructor', () => {
        it('should initialize with config service', () => {
            expect(configService.get).toHaveBeenCalledWith('GOOGLE_MAPS_API_KEY');
        });
    });

    describe('Error handling', () => {
        it('should handle missing API key gracefully', async () => {
            jest.spyOn(configService, 'get').mockReturnValue(undefined);
            
            const newModule = await Test.createTestingModule({
                providers: [
                    GeoService,
                    {
                        provide: ConfigService,
                        useValue: {
                            get: jest.fn().mockReturnValue(undefined),
                        },
                    },
                ],
            }).compile();

            const newService = newModule.get<GeoService>(GeoService);
            expect(newService).toBeDefined();
        });
    });
});