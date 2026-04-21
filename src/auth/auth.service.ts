import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const exists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (exists) {
        this.logger.warn(`Registration failed: Email already in use - ${dto.email}`);
        throw new ConflictException('Email already in use');
      }

      const hashed = await bcrypt.hash(dto.password, 10);
      const user = await this.prisma.user.create({
        data: { email: dto.email, name: dto.name, password: hashed },
      });

      const token = this.signToken(user.id, user.email);
      return { user: this.sanitize(user), token };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.logger.error(`Error during registration for ${dto.email}`, error);
      throw error;
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (!user) {
        this.logger.warn(`Login failed: User not found - ${dto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const valid = await bcrypt.compare(dto.password, user.password);
      if (!valid) {
        this.logger.warn(`Login failed: Invalid password - ${dto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = this.signToken(user.id, user.email);
      return { user: this.sanitize(user), token };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error(`Error during login for ${dto.email}`, error);
      throw error;
    }
  }

  async me(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      return this.sanitize(user);
    } catch (error) {
      this.logger.error(`Error fetching user profile for userId: ${userId}`, error);
      throw error;
    }
  }

  private signToken(userId: string, email: string) {
    return this.jwt.sign({ sub: userId, email });
  }

  private sanitize(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
