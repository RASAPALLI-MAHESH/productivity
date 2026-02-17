import { useState, FormEvent, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score, label: 'Weak', color: 'var(--error)' };
    if (score <= 2) return { score, label: 'Fair', color: 'var(--warning)' };
    if (score <= 3) return { score, label: 'Good', color: 'var(--info)' };
    return { score, label: 'Strong', color: 'var(--success)' };
}

export function Signup() {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const { signup, loading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const strength = useMemo(() => getPasswordStrength(password), [password]);
    const passwordsMatch = confirmPassword === '' || password === confirmPassword;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();

        if (password !== confirmPassword) return;
        if (!acceptTerms) return;

        try {
            await signup(email, password, displayName);
            navigate('/verify-otp');
        } catch {
            // error set in store
        }
    };

    return (
        <div className="auth-container">
            {/* Left — Branding */}
            <div className="auth-branding">
                <div className="animate-up">
                    <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: 8 }}>
                        Productiv
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        The workspace designed<br />
                        for clarity, speed, and<br />
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>deep focus.</span>
                    </p>
                </div>
            </div>

            {/* Right — Form */}
            <div className="auth-card">
                <h1>Create your account</h1>
                <p>Get started with Productiv — it's free.</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="displayName">Full name</label>
                        <input
                            id="displayName"
                            type="text"
                            className="input"
                            placeholder="John Doe"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="password">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                className="input"
                                placeholder="Min 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                autoComplete="new-password"
                                style={{ paddingRight: 40 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                        {/* Strength Meter — Minimal bar */}
                        {password && (
                            <div style={{ marginTop: 6 }}>
                                <div style={{ display: 'flex', gap: 3 }}>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} style={{
                                            flex: 1, height: 3,
                                            borderRadius: 'var(--radius-full)',
                                            background: i <= strength.score ? strength.color : 'var(--border)',
                                            transition: 'background 100ms ease',
                                        }} />
                                    ))}
                                </div>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: strength.color, marginTop: 2, display: 'inline-block' }}>
                                    {strength.label}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="confirmPassword">Confirm password</label>
                        <input
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            className="input"
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            style={{ borderColor: !passwordsMatch ? 'var(--error)' : undefined }}
                        />
                        {!passwordsMatch && (
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--error)' }}>
                                Passwords do not match
                            </span>
                        )}
                    </div>

                    <label style={{
                        display: 'flex', alignItems: 'flex-start', gap: 8,
                        fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)',
                        cursor: 'pointer', marginBottom: 'var(--space-2)',
                    }}>
                        <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            required
                            style={{ accentColor: 'var(--primary)', marginTop: 2 }}
                        />
                        I agree to the Terms of Service and Privacy Policy
                    </label>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading || !acceptTerms || !passwordsMatch}
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
