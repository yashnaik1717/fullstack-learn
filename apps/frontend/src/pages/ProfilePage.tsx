import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, logout, updateProfile, error, clearError } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);
    setSuccessMessage(null);

    // Skip if nothing changed
    if (name === user?.name && !newPassword) {
      return;
    }

    const payload: { name?: string; currentPassword?: string; newPassword?: string } = {};

    if (name !== user?.name) {
      payload.name = name;
    }

    if (newPassword) {
      if (!currentPassword) {
        setValidationError('Current password is required to change password');
        return;
      }
      if (newPassword !== confirmPassword) {
        setValidationError('New passwords do not match');
        return;
      }
      if (newPassword.length < 8) {
        setValidationError('New password must be at least 8 characters long');
        return;
      }
      if (
        !/[A-Z]/.test(newPassword) ||
        !/[a-z]/.test(newPassword) ||
        !/[0-9]/.test(newPassword) ||
        !/[^a-zA-Z0-9]/.test(newPassword)
      ) {
        setValidationError(
          'New password must contain uppercase, lowercase, number, and special character',
        );
        return;
      }
      payload.newPassword = newPassword;
      payload.currentPassword = currentPassword;
    }

    try {
      setIsSubmitting(true);
      await updateProfile(payload);
      setSuccessMessage('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      // Handled by context error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        fontFamily: 'system-ui, sans-serif',
        color: '#f8fafc',
        padding: '2rem',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '800px',
          margin: '0 auto 2.5rem auto',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid #334155',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8', margin: 0 }}>
            LearnEngine Console
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Account Control Center
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #475569',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          Logout
        </button>
      </div>

      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2rem',
        }}
      >
        {/* Profile Card */}
        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '2rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              color: '#f8fafc',
              margin: '0 0 1.5rem 0',
            }}
          >
            Account Profile
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #334155',
                paddingBottom: '0.75rem',
              }}
            >
              <span style={{ width: '120px', color: '#94a3b8', fontSize: '0.875rem' }}>Name</span>
              <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: 500 }}>
                {user?.name}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #334155',
                paddingBottom: '0.75rem',
              }}
            >
              <span style={{ width: '120px', color: '#94a3b8', fontSize: '0.875rem' }}>Email</span>
              <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: 500 }}>
                {user?.email}
              </span>
            </div>
            <div style={{ display: 'flex', paddingBottom: '0.25rem' }}>
              <span style={{ width: '120px', color: '#94a3b8', fontSize: '0.875rem' }}>
                Access Role
              </span>
              <span
                style={{
                  color: user?.role === 'ADMIN' ? '#f43f5e' : '#10b981',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: user?.role === 'ADMIN' ? '#881337' : '#064e3b',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  width: 'fit-content',
                }}
              >
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '2rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              color: '#f8fafc',
              margin: '0 0 1.5rem 0',
            }}
          >
            Update Profile Settings
          </h2>

          {/* Messages Banner */}
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
              }}
            >
              {validationError || error}
            </div>
          )}

          {successMessage && (
            <div
              style={{
                backgroundColor: '#064e3b',
                border: '1px solid #065f46',
                color: '#a7f3d0',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
              }}
            >
              {successMessage}
            </div>
          )}

          <form
            onSubmit={handleUpdate}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label
                htmlFor="update-name"
                style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}
              >
                Full Name
              </label>
              <input
                id="update-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
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
                required
              />
            </div>

            <div
              style={{
                borderTop: '1px solid #334155',
                paddingTop: '1.5rem',
                marginTop: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', margin: 0 }}>
                Change Password (optional)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label
                  htmlFor="current-pass"
                  style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}
                >
                  Current Password
                </label>
                <input
                  id="current-pass"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
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
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label
                  htmlFor="new-pass"
                  style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}
                >
                  New Password
                </label>
                <input
                  id="new-pass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
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
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label
                  htmlFor="confirm-new-pass"
                  style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-new-pass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
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
                />
              </div>
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
                marginTop: '1rem',
                alignSelf: 'flex-start',
              }}
            >
              {isSubmitting ? 'Saving changes...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
