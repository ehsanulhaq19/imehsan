import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserType } from '../../database/entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email: email.toLowerCase().trim() } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async createSystemUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }) {
    const hash = await bcrypt.hash(data.password, 10);
    const user = this.repo.create({
      email: data.email.toLowerCase().trim(),
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash: hash,
      userType: UserType.SYSTEM,
    });
    return this.repo.save(user);
  }

  async createBooker(data: { email: string; firstName?: string; lastName?: string }) {
    const user = this.repo.create({
      email: data.email.toLowerCase().trim(),
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      passwordHash: null,
      userType: UserType.BOOKER,
    });
    return this.repo.save(user);
  }

  findSystemUsers() {
    return this.repo.find({ where: { userType: UserType.SYSTEM } });
  }
}
