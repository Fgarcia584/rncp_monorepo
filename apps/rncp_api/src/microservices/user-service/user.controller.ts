import {
    Controller,
    Get,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    Post,
    Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth-service/guards/jwt-auth.guard';
import { Public } from '../auth-service/decorators/public.decorator';
import { User, UserRole, JwtPayload } from '@rncp/types';
import { Roles, RolesGuard, CurrentUser } from '../../common';
import {
    CreateUserRequestDto,
    UpdateUserRequestDto,
    UpdateUserRoleDto,
} from './dto/user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @Roles(UserRole.ADMIN)
    async findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Get('me')
    async getProfile(@CurrentUser() user: JwtPayload): Promise<User> {
        return this.userService.findById(user.sub);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN)
    async findById(@Param('id', ParseIntPipe) id: number): Promise<User> {
        return this.userService.findById(id);
    }

    @Post()
    @Roles(UserRole.ADMIN)
    async create(@Body() createUserDto: CreateUserRequestDto): Promise<User> {
        return this.userService.create(createUserDto);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserRequestDto,
        @CurrentUser() currentUser: JwtPayload,
    ): Promise<User> {
        // Users can only update their own profile, admins can update anyone
        if (currentUser.role !== UserRole.ADMIN && currentUser.sub !== id) {
            throw new Error('Forbidden: You can only update your own profile');
        }

        // Only admins can change roles
        if (updateUserDto.role && currentUser.role !== UserRole.ADMIN) {
            delete updateUserDto.role;
        }

        return this.userService.update(id, updateUserDto);
    }

    @Patch(':id/role')
    @Roles(UserRole.ADMIN)
    async updateRole(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRoleDto: UpdateUserRoleDto,
    ): Promise<User> {
        return this.userService.updateRole(id, updateRoleDto.role);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
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

    @Public()
    @Get('debug-test')
    debugTest(): { message: string } {
        return { message: 'Debug endpoint working - guard bypassed!' };
    }
}
