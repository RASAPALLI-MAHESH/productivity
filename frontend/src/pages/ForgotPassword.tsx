import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AuthLayout } from '../components/AuthLayout';

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

    const footerNode = (
        <>
            Remember your password? <Link to="/login">Sign in</Link>
        </>
    );

    return (
        <AuthLayout
            title="Forgot password?"
            subtitle="No worries. Enter your email and we'll send you a reset code."
            error={error}
            footer={footerNode}
        >
            <form onSubmit={handleSubmit}>
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

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{ marginTop: 'var(--space-2)' }}
                >
                    {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
            </form>
        </AuthLayout>
    );
}
