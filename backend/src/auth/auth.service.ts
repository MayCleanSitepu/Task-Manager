import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private repository: AuthRepository,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const userExists = await this.repository.findByEmail(dto.email);
    if (userExists) throw new ConflictException('Email already used');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.repository.createUser({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    const result = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return result;
  }

  async login(dto: LoginDto): Promise<{ access_token: string; user: any }> {
    const user = await this.repository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async findAll() {
    return this.repository.findAll();
  }
}
