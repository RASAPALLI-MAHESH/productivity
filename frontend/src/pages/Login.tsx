import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AuthLayout } from '../components/AuthLayout';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { login, loginWithGoogle, loading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        clearError();
        try {
            await loginWithGoogle();
            navigate('/');
        } catch {
            // Error managed by store
        }
    };

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
            <div className="auth-social-buttons mb-4">
                <button
                    type="button"
                    className="btn-social w-full flex items-center justify-center gap-3"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                    </svg>
                    Continue with Google
                </button>
            </div>

            <div className="auth-divider">or continue with email</div>

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
