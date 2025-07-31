import { Injectable } from '@nestjs/common';

export interface User {
    id: number;
    name: string;
    email: string;
}

@Injectable()
export class UserService {
    private users: User[] = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ];

    findAll(): User[] {
        return this.users;
    }

    findById(id: number): User | undefined {
        return this.users.find((user) => user.id === id);
    }

    create(user: Omit<User, 'id'>): User {
        const newUser = {
            ...user,
            id: this.users.length + 1,
        };
        this.users.push(newUser);
        return newUser;
    }
}
