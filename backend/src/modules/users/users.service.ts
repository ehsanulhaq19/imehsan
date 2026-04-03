import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User, UserType } from '../../database/entities/user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findById(id: string) {
    return this.usersRepository.findById(id);
  }

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async validateSystemUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user || user.userType !== UserType.SYSTEM || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  createSystemUser(payload: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }) {
    return this.usersRepository.createSystemUser(payload);
  }

  createBooker(data: { email: string; firstName?: string; lastName?: string }) {
    return this.usersRepository.createBooker(data);
  }

  async ensureBooker(data: { email: string; firstName?: string; lastName?: string }) {
    const existing = await this.findByEmail(data.email);
    if (existing) return existing;
    return this.createBooker(data);
  }

  systemUsers() {
    return this.usersRepository.findSystemUsers();
  }
}
