import {
    Controller,
    Get,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth-service/guards/jwt-auth.guard';
import { Public } from '../auth-service/decorators/public.decorator';
import { User, UpdateUserDto } from '@rncp/types';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Get(':id')
    async findById(@Param('id', ParseIntPipe) id: number): Promise<User> {
        return this.userService.findById(id);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User> {
        return this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.userService.remove(id);
    }

    @Public()
    @Get('health')
    getHealth(): { status: string; service: string; timestamp: string } {
        return {
            status: 'ok',
            service: 'user-service',
            timestamp: new Date().toISOString(),
        };
    }
}
