import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { authConfig } from '../config/auth';
import { auditService } from './audit.service';
import { AuditAction, UserRole } from '@prisma/client';
import crypto from 'crypto';

export class AuthService {
  async register(params: {
    email: string;
    passwordHash?: string;
    password?: string;
    name: string;
  }) {
    const existingUser = await userRepository.findByEmail(params.email);
    if (existingUser) {
      throw new Error('Email is already registered');
    }

    const rawPassword = params.password || '';
    const passwordHash = await bcrypt.hash(rawPassword, authConfig.bcryptSaltRounds);

    const user = await userRepository.create({
      email: params.email,
      passwordHash,
      name: params.name,
      role: UserRole.STUDENT,
    });

    await auditService.log({
      actorId: user.id,
      action: AuditAction.CREATE,
      targetEntity: 'users',
      targetId: user.id,
      newValues: { email: user.email, name: user.name, role: user.role },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async login(params: {
    email: string;
    password?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const user = await userRepository.findByEmail(params.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const rawPassword = params.password || '';
    const isPasswordValid = await bcrypt.compare(rawPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate Tokens
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      authConfig.jwt.accessSecret,
      { expiresIn: authConfig.jwt.accessExpiry },
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + authConfig.cookie.options.maxAge);

    // Save Session to Database
    await userRepository.createSession({
      userId: user.id,
      token: refreshToken,
      expiresAt,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    await auditService.log({
      actorId: user.id,
      action: AuditAction.UPDATE,
      targetEntity: 'users',
      targetId: user.id,
      newValues: { action: 'LOGIN' },
      ipAddress: params.ipAddress,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    const session = await userRepository.findSessionByToken(refreshToken);
    if (!session) {
      throw new Error('Invalid session refresh token');
    }

    if (new Date() > session.expiresAt) {
      await userRepository.deleteSession(refreshToken);
      throw new Error('Session has expired. Please login again');
    }

    // Generate New Access Token
    const accessToken = jwt.sign(
      { sub: session.user.id, email: session.user.email, role: session.user.role },
      authConfig.jwt.accessSecret,
      { expiresIn: authConfig.jwt.accessExpiry },
    );

    return {
      accessToken,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
    };
  }

  async logout(refreshToken: string) {
    const session = await userRepository.findSessionByToken(refreshToken);
    if (session) {
      await userRepository.deleteSession(refreshToken);
      await auditService.log({
        actorId: session.userId,
        action: AuditAction.UPDATE,
        targetEntity: 'users',
        targetId: session.userId,
        newValues: { action: 'LOGOUT' },
      });
    }
  }

  // Simulated Email Verification & Password Reset Tokens
  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Security practice: do not leak if email exists or not
      return;
    }

    // Generate a temporary reset token and log to console
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log(`[AUTH DEVELOPMENT SIMULATOR] Password reset token for ${email}: ${resetToken}`);

    // Store in metadata or logs for development verification
    await auditService.log({
      actorId: user.id,
      action: AuditAction.UPDATE,
      targetEntity: 'users',
      targetId: user.id,
      newValues: { request: 'PASSWORD_RESET', token: resetToken },
    });
  }

  async resetPassword(resetToken: string, rawPassword?: string) {
    // Find the latest reset token audit log to verify authenticity
    const auditLogs = await prisma.auditTrail.findMany({
      where: {
        targetEntity: 'users',
        action: AuditAction.UPDATE,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    let userId: string | null = null;
    for (const log of auditLogs) {
      const vals = log.newValues as any;
      if (vals && vals.request === 'PASSWORD_RESET' && vals.token === resetToken) {
        // Simple expiry verification: 1 hour
        const logAgeMs = Date.now() - new Date(log.createdAt).getTime();
        if (logAgeMs < 60 * 60 * 1000) {
          userId = log.actorId;
          break;
        }
      }
    }

    if (!userId) {
      throw new Error('Invalid or expired password reset token');
    }

    const passwordHash = await bcrypt.hash(rawPassword || '', authConfig.bcryptSaltRounds);
    await userRepository.update(userId, { passwordHash });

    await auditService.log({
      actorId: userId,
      action: AuditAction.UPDATE,
      targetEntity: 'users',
      targetId: userId,
      newValues: { action: 'PASSWORD_RESET_SUCCESS' },
    });
  }
}

// Access prisma inside auth.service to search audit logs for token recovery
import { prisma } from '../config/db';

export const authService = new AuthService();
