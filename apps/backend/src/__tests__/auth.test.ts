import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index';
import { prisma } from '../config/db';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';
import bcrypt from 'bcryptjs';

// Mock the Prisma Client singleton module
vi.mock('../config/db', () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findFirst: vi.fn(),
      },
      session: {
        create: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
      auditTrail: {
        create: vi.fn(),
      },
    },
  };
});

describe('Authentication API Endpoint Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user', async () => {
      // Mock findUnique to return null (no existing email)
      (prisma.user.findUnique as any).mockResolvedValue(null);
      // Mock user.create to return a dummy user record
      (prisma.user.create as any).mockResolvedValue({
        id: 'user-uuid-1',
        email: 'test@example.com',
        name: 'Test Student',
        role: 'STUDENT',
      });

      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test Student',
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: 'user-uuid-1',
        email: 'test@example.com',
        name: 'Test Student',
        role: 'STUDENT',
      });
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('should fail registration if email is already in use', async () => {
      // Mock findUnique to return an existing user record
      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'existing-id',
        email: 'test@example.com',
      });

      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Duplicate Student',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email is already registered');
    });

    it('should fail registration if validation rules are violated', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email-format',
        password: '123', // Too short, no caps/special chars
        name: 'A', // Too short
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and return access token + refresh token cookie', async () => {
      const hash = await bcrypt.hash('Password123!', 10);

      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'user-uuid-1',
        email: 'test@example.com',
        passwordHash: hash,
        name: 'Test Student',
        role: 'STUDENT',
      });
      (prisma.session.create as any).mockResolvedValue({
        id: 'session-uuid-1',
      });

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).toEqual({
        id: 'user-uuid-1',
        email: 'test@example.com',
        name: 'Test Student',
        role: 'STUDENT',
      });

      // Verify cookie is set
      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken=');
      expect(cookies[0]).toContain('HttpOnly');
    });

    it('should fail login on incorrect credentials', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null); // No user found

      const response = await request(app).post('/api/auth/login').send({
        email: 'notfound@example.com',
        password: 'Password123!',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile if authenticated', async () => {
      const testToken = jwt.sign(
        { sub: 'user-uuid-1', email: 'test@example.com', role: 'STUDENT' },
        authConfig.jwt.accessSecret,
      );

      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'user-uuid-1',
        email: 'test@example.com',
        name: 'Test Student',
        role: 'STUDENT',
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 'user-uuid-1',
        email: 'test@example.com',
        name: 'Test Student',
        role: 'STUDENT',
      });
    });

    it('should reject access if no auth token is provided', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authorization token is required');
    });
  });
});
