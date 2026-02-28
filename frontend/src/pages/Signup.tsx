import { useState, FormEvent, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AuthLayout } from '../components/AuthLayout';

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

    const footerNode = (
        <>
            Already have an account? <Link to="/login">Sign in</Link>
        </>
    );

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Get started with Productiv — it's free."
            error={error}
            footer={footerNode}
        >
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
                    <div style={{ position: 'relative', width: '100%' }}>
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
                    {/* Strength Meter */}
                    {password && (
                        <div style={{ marginTop: 6, paddingLeft: 4 }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} style={{
                                        flex: 1, height: 4,
                                        borderRadius: 'var(--radius-sm)',
                                        background: i <= strength.score ? strength.color : 'var(--border)',
                                        transition: 'background 200ms ease',
                                    }} />
                                ))}
                            </div>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: strength.color, marginTop: 4, display: 'inline-block' }}>
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
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--error)', marginTop: 4 }}>
                            Passwords do not match
                        </span>
                    )}
                </div>

                <div className="custom-checkbox-row" style={{ marginTop: 'var(--space-2)' }}>
                    <label className="custom-checkbox-label">
                        <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            required
                            className="custom-checkbox"
                        />
                        I agree to the Terms of Service and Privacy Policy
                    </label>
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || !acceptTerms || !passwordsMatch}
                >
                    {loading ? 'Creating account...' : 'Create account'}
                </button>
            </form>
        </AuthLayout>
    );
}
