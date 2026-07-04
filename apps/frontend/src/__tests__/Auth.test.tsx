import { describe, it, expect } from 'vitest';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

describe('Frontend Authentication Components Importation & Existence', () => {
  it('should successfully import LoginPage component', () => {
    expect(LoginPage).toBeTypeOf('function');
  });

  it('should successfully import RegisterPage component', () => {
    expect(RegisterPage).toBeTypeOf('function');
  });

  it('should successfully import AuthProvider context module', () => {
    expect(AuthProvider).toBeTypeOf('function');
    expect(useAuth).toBeTypeOf('function');
  });
});
