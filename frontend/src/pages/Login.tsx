import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { login, loading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        try {
            await login(email, password);
            const step = useAuthStore.getState().authStep;
            if (step === 'account-locked') {
                navigate('/account-locked');
            } else if (step === 'email-not-verified') {
                navigate('/email-not-verified');
            } else {
                navigate('/');
            }
        } catch {
            // error set in store
        }
    };

    return (
        <div className="auth-container">
            {/* Left — Branding (desktop only) */}
            <div className="auth-branding">
                <div className="animate-up">
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)', filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.6))' }}>🚀</div>
                    <h1 className="glow-text" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                        Productiv
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', lineHeight: 1.6 }}>
                        The launchpad for<br />
                        your biggest goals.<br />
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Master your day.</span>
                    </p>
                </div>
            </div>

            {/* Right — Auth Card */}
            <div className="auth-card">
                <h1>Welcome back</h1>
                <p>Sign in to continue your productivity streak</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
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
                            autoFocus
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="password">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                className="input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                autoComplete="current-password"
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
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                style={{ accentColor: 'var(--accent)' }}
                            />
                            Remember me
                        </label>
                        <Link to="/forgot-password" className="auth-link">
                            Forgot password?
                        </Link>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/signup">Create one</Link>
                </div>
            </div>
        </div>
    );
}
