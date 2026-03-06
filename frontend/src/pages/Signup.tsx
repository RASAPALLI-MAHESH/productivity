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
    const { signup, loginWithGoogle, loading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleGoogleSignup = async () => {
        clearError();
        try {
            await loginWithGoogle();
            navigate('/');
        } catch {
            // Error managed by store
        }
    };

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
            subtitle="Start your productivity journey — it's free."
            error={error}
            footer={footerNode}
        >
            <form onSubmit={handleSubmit} className="auth-form-signup">
                <div className="auth-divider animate-slide-up-fade stagger-1">or continue with email</div>
                <div className="input-group animate-slide-up-fade stagger-3">
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

                <div className="input-group animate-slide-up-fade stagger-4">
                    <label className="input-label" htmlFor="email">Email address</label>
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

                <div className="input-group animate-slide-up-fade stagger-5">
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
                            tabIndex={-1}
                        >
                            <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                    </div>
                    {/* Strength Meter */}
                    {password && (
                        <div style={{ marginTop: 4, paddingLeft: 4 }}>
                            <div style={{ display: 'flex', gap: 3 }}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} style={{
                                        flex: 1, height: 3,
                                        borderRadius: 'var(--radius-sm)',
                                        background: i <= strength.score ? strength.color : 'var(--border)',
                                        transition: 'background 200ms ease',
                                    }} />
                                ))}
                            </div>
                            <span style={{ fontSize: '11px', color: strength.color, marginTop: 2, display: 'inline-block' }}>
                                {strength.label}
                            </span>
                        </div>
                    )}
                </div>

                <div className="input-group animate-slide-up-fade stagger-6">
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

                <div className="custom-checkbox-row custom-checkbox-row-terms">
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

                <div className="auth-buttons-row animate-slide-up-fade stagger-1">
                    <button
                        type="button"
                        className="btn-social btn-social-compact"
                        onClick={handleGoogleSignup}
                        disabled={loading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                        </svg>
                        Google
                    </button>
                    <button
                        type="submit"
                        className="btn-primary btn-primary-compact"
                        disabled={loading || !acceptTerms || !passwordsMatch}
                    >
                        {loading ? 'Creating...' : 'Create account'}
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
}
