import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { authConfig } from '../config/auth';
import { userRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';

const getCookie = (req: Request, name: string): string | null => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const cookie of cookies) {
    const [k, v] = cookie.split('=');
    if (k === name) return decodeURIComponent(v);
  }
  return null;
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      const user = await authService.register({ email, password, name });
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login({ email, password, ipAddress, userAgent });

      // Set HttpOnly refresh token cookie
      res.cookie(
        authConfig.cookie.refreshCookieName,
        result.refreshToken,
        authConfig.cookie.options,
      );

      res.status(200).json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = getCookie(req, authConfig.cookie.refreshCookieName);
      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token cookie is missing' });
      }

      const result = await authService.refresh(refreshToken);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = getCookie(req, authConfig.cookie.refreshCookieName);
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      // Clear refresh token cookie
      res.clearCookie(authConfig.cookie.refreshCookieName, {
        httpOnly: true,
        secure: authConfig.cookie.options.secure,
        sameSite: 'strict',
      });

      res.status(200).json({ status: 'logged_out' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      res.status(200).json({ message: 'If the email exists, a reset token has been sent.' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const user = await userRepository.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const { name, currentPassword, newPassword } = req.body;

      const user = await userRepository.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updates: { name?: string; passwordHash?: string } = {};

      if (name) {
        updates.name = name;
      }

      if (newPassword) {
        // Validate current password before changing
        const isPasswordValid = await bcrypt.compare(currentPassword || '', user.passwordHash);
        if (!isPasswordValid) {
          return res.status(400).json({ error: 'Incorrect current password' });
        }
        updates.passwordHash = await bcrypt.hash(newPassword, authConfig.bcryptSaltRounds);
      }

      const updatedUser = await userRepository.update(req.user.id, updates);
      res.status(200).json({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const authController = new AuthController();
