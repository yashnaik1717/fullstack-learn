import { prisma } from '../config/db';
import { UserRole } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: { email: string; passwordHash: string; name: string; role?: UserRole }) {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role || UserRole.STUDENT,
      },
    });
  }

  async update(id: string, data: { name?: string; passwordHash?: string }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  // Session Management
  async createSession(session: {
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.session.create({
      data: session,
    });
  }

  async findSessionByToken(token: string) {
    return prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deleteSession(token: string) {
    return prisma.session.delete({
      where: { token },
    });
  }

  async deleteSessionsByUserId(userId: string) {
    return prisma.session.deleteMany({
      where: { userId },
    });
  }
}

export const userRepository = new UserRepository();
