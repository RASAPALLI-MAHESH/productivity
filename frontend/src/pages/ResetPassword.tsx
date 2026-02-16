import { useState, FormEvent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score, label: 'Weak', color: 'var(--critical)' };
    if (score <= 2) return { score, label: 'Fair', color: 'var(--warning)' };
    if (score <= 3) return { score, label: 'Good', color: 'var(--accent)' };
    return { score, label: 'Strong', color: 'var(--success)' };
}

export function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);
    const { resetPassword, loading, error, clearError, authStep } = useAuthStore();
    const navigate = useNavigate();

    const strength = useMemo(() => getPasswordStrength(password), [password]);
    const passwordsMatch = confirmPassword === '' || password === confirmPassword;

    // Guard: only accessible when authStep is 'reset-password'
    if (authStep !== 'reset-password' && !success) {
        navigate('/forgot-password');
        return null;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        if (password !== confirmPassword) return;
        try {
            await resetPassword(password);
            setSuccess(true);
        } catch {
            // error set in store
        }
    };

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card" style={{ maxWidth: 440, textAlign: 'center' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-4)', animation: 'bounceIn 500ms cubic-bezier(0.16, 1, 0.3, 1)' }}>✅</div>
                    <h1>Password reset!</h1>
                    <p>Your password has been updated successfully. You can now sign in with your new password.</p>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => navigate('/login')}
                        style={{ marginTop: 'var(--space-6)', width: '100%' }}
                    >
                        Go to Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: 440, textAlign: 'center' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-4)' }}>🔒</div>
                <h1>Set new password</h1>
                <p>Choose a strong password to secure your account</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left', marginTop: 'var(--space-6)' }}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="newPassword">New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                className="input"
                                placeholder="Min 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                autoComplete="new-password"
                                autoFocus
                                style={{ paddingRight: 48 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {/* Strength Meter */}
                        {password && (
                            <div style={{ marginTop: 'var(--space-2)' }}>
                                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} style={{
                                            flex: 1, height: 3,
                                            borderRadius: 'var(--radius-full)',
                                            background: i <= strength.score ? strength.color : 'var(--border)',
                                            transition: 'all 200ms ease',
                                        }} />
                                    ))}
                                </div>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: strength.color }}>
                                    {strength.label}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="confirmNewPassword">Confirm Password</label>
                        <input
                            id="confirmNewPassword"
                            type={showPassword ? 'text' : 'password'}
                            className="input"
                            placeholder="Re-enter new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            style={{ borderColor: !passwordsMatch ? 'var(--critical)' : undefined }}
                        />
                        {!passwordsMatch && (
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--critical)', marginTop: 'var(--space-1)' }}>
                                Passwords do not match
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading || !passwordsMatch || strength.score < 2}
                        style={{ marginTop: 'var(--space-2)' }}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
