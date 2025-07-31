import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { UserService, User } from './user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    findAll(): User[] {
        return this.userService.findAll();
    }

    @Get(':id')
    findById(@Param('id', ParseIntPipe) id: number): User | undefined {
        return this.userService.findById(id);
    }

    @Post()
    create(@Body() user: Omit<User, 'id'>): User {
        return this.userService.create(user);
    }

    @Get('health')
    getHealth(): { status: string; service: string; timestamp: string } {
        return {
            status: 'ok',
            service: 'user-service',
            timestamp: new Date().toISOString(),
        };
    }
}
