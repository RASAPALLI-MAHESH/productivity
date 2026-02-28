import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AuthLayout } from '../components/AuthLayout';

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

    const footerNode = (
        <>
            Don't have an account? <Link to="/signup">Create one</Link>
        </>
    );

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Let's get you focused."
            error={error}
            footer={footerNode}
        >
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
                    <div style={{ position: 'relative', width: '100%' }}>
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
                            style={{ paddingRight: 40 }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="password-toggle"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            <span className="material-symbols-outlined">
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="custom-checkbox-row">
                    <label className="custom-checkbox-label">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="custom-checkbox"
                        />
                        Remember me
                    </label>
                    <Link to="/forgot-password" className="auth-link">
                        Forgot password?
                    </Link>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
        </AuthLayout>
    );
}
