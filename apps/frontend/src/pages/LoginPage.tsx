import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email, password });
      navigate('/profile');
    } catch (err) {
      // Handled by context error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#f8fafc',
          margin: '0 0 1.5rem 0',
          textAlign: 'center',
        }}
      >
        Log in to your account
      </h3>

      {/* Error Banners */}
      {(validationError || error) && (
        <div
          style={{
            backgroundColor: '#451a03',
            border: '1px solid #78350f',
            color: '#fef3c7',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            lineHeight: '1.25rem',
          }}
        >
          {validationError || error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label
            htmlFor="email"
            style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setValidationError(null);
            }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #475569',
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              fontSize: '0.875rem',
              outline: 'none',
            }}
            placeholder="name@example.com"
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label
              htmlFor="password"
              style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              style={{ fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'none' }}
              onClick={clearError}
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setValidationError(null);
            }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #475569',
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              fontSize: '0.875rem',
              outline: 'none',
            }}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: isSubmitting ? '#0284c7' : '#0ea5e9',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            marginTop: '0.5rem',
          }}
        >
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div
        style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}
      >
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 500 }}
          onClick={clearError}
        >
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
