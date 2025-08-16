import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities';
import { UpdateUserDto } from '@rncp/types';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async findAll(): Promise<User[]> {
        return this.userRepository.find({
            select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
        });
    }

    async findById(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findById(id);

        Object.assign(user, updateUserDto);

        const updatedUser = await this.userRepository.save(user);

        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
        } as User;
    }

    async remove(id: number): Promise<void> {
        const user = await this.findById(id);
        await this.userRepository.remove(user);
    }
}
