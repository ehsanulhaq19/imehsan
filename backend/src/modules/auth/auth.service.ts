import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserType } from '../../database/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.validateSystemUser(email, password);
    const token = await this.jwtService.signAsync({
      sub: user.id,
      typ: 'system',
    });
    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async validateUserId(sub: string) {
    const user = await this.usersService.findById(sub);
    if (!user || user.userType !== UserType.SYSTEM) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
