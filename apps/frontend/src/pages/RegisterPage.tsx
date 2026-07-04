import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (!name || !email || !password || !confirmPassword) {
      setValidationError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    // Basic password complexity validation matching backend zod checks
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }
    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^a-zA-Z0-9]/.test(password)
    ) {
      setValidationError(
        'Password must contain uppercase, lowercase, number, and special character',
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await register({ name, email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      // Error is stored in context
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <div style={{ fontSize: '3rem', color: '#10b981', marginBottom: '1rem' }}>✓</div>
        <h3
          style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}
        >
          Registration successful!
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.25rem' }}>
          Your account has been created. Redirecting you to the login page...
        </p>
      </div>
    );
  }

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
        Create an account
      </h3>

      {/* Errors */}
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
        style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label htmlFor="name" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setValidationError(null);
            }}
            style={{
              padding: '0.7rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid #475569',
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              fontSize: '0.875rem',
              outline: 'none',
            }}
            placeholder="John Doe"
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
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
              padding: '0.7rem 0.9rem',
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label
            htmlFor="password"
            style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setValidationError(null);
            }}
            style={{
              padding: '0.7rem 0.9rem',
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label
            htmlFor="confirmPassword"
            style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setValidationError(null);
            }}
            style={{
              padding: '0.7rem 0.9rem',
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
          {isSubmitting ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div
        style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}
      >
        Already have an account?{' '}
        <Link
          to="/login"
          style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 500 }}
          onClick={clearError}
        >
          Log in
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
