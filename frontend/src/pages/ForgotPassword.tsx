import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const { forgotPassword, loading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        try {
            await forgotPassword(email);
            navigate('/verify-otp');
        } catch {
            // error set in store
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: 440, textAlign: 'center' }}>
                <div style={{ marginBottom: 'var(--space-2)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--text-secondary)' }}>key</span>
                </div>
                <h1>Forgot password?</h1>
                <p>No worries. Enter your email and we'll send you a reset code.</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left', marginTop: 'var(--space-6)' }}>
                    <div className="input-group">
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
                            autoFocus
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 'var(--space-2)' }}>
                        {loading ? 'Sending...' : 'Send Reset Code'}
                    </button>
                </form>

                <div className="auth-footer">
                    Remember your password? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
