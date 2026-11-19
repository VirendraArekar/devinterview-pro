import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, UserRole } from '../database/entities/user.entity';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepository.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name,
      experienceLevel: dto.experienceLevel || '3–5 Years',
      targetCompensation: dto.targetCompensation || '₹20–25 LPA',
      role: UserRole.USER,
      dailyStreak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      emailVerified: true,
    });

    const savedUser = await this.userRepository.save(user);
    const tokens = await this.generateTokens(savedUser);
    await this.updateRefreshToken(savedUser.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(savedUser),
      tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: dto.email.toLowerCase() })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update daily streak
    const today = new Date().toISOString().split('T')[0];
    if (user.lastActiveDate !== today) {
      user.dailyStreak = (user.dailyStreak || 0) + 1;
      user.lastActiveDate = today;
      await this.userRepository.save(user);
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          'devinterview_refresh_secret_key_2026_very_secure_long_string',
        ),
      });

      const user = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.refreshTokenHash')
        .where('user.id = :id', { id: payload.sub })
        .getOne();

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isMatch) {
        throw new UnauthorizedException('Refresh token is invalid or expired');
      }

      // Token rotation
      const tokens = await this.generateTokens(user);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        user: this.sanitizeUser(user),
        tokens,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: number) {
    await this.userRepository.update(userId, { refreshTokenHash: null });
    return { success: true, message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      // Return success anyway to avoid user enumeration
      return {
        success: true,
        message: 'If the email exists, a password reset link has been dispatched.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour validity

    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpires = expires;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Password reset token generated successfully',
      debugToken: resetToken, // Provided for easy development / demo testing
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(dto.token)
      .digest('hex');

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect(['user.resetPasswordToken', 'user.resetPasswordExpires'])
      .where('user.resetPasswordToken = :token', { token: hashedToken })
      .getOne();

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Reset token is invalid or has expired');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(dto.newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.userRepository.save(user);

    return { success: true, message: 'Password has been reset successfully. Please login.' };
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(
          'JWT_SECRET',
          'devinterview_super_secure_jwt_secret_key_2026_at_least_32_characters_long',
        ),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          'devinterview_refresh_secret_key_2026_very_secure_long_string',
        ),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(refreshToken, salt);
    await this.userRepository.update(userId, { refreshTokenHash: hash });
  }

  private sanitizeUser(user: User) {
    const {
      passwordHash,
      refreshTokenHash,
      resetPasswordToken,
      resetPasswordExpires,
      ...safeUser
    } = user as any;
    return safeUser;
  }
}
