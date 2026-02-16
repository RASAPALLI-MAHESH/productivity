import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function EmailNotVerified() {
    const [resending, setResending] = useState(false);
    const [sent, setSent] = useState(false);
    const { pendingEmail, resendOtp, logout, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleResend = async () => {
        if (!pendingEmail || resending) return;
        clearError();
        setResending(true);
        try {
            await resendOtp(pendingEmail);
            setSent(true);
            // Navigate to OTP verification
            setTimeout(() => navigate('/verify-otp'), 1500);
        } catch {
            // error set in store
        } finally {
            setResending(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: 440, textAlign: 'center' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-4)' }}>📧</div>
                <h1>Verify your email</h1>
                <p>
                    Your email address hasn't been verified yet. Please verify to access your dashboard.
                </p>

                {pendingEmail && (
                    <div style={{
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-3) var(--space-4)',
                        marginTop: 'var(--space-4)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                    }}>
                        {pendingEmail}
                    </div>
                )}

                {error && <div className="auth-error" style={{ marginTop: 'var(--space-4)' }}>{error}</div>}

                {sent ? (
                    <div style={{
                        marginTop: 'var(--space-6)',
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--success)',
                        fontSize: 'var(--font-size-sm)',
                    }}>
                        ✅ Verification code sent! Redirecting…
                    </div>
                ) : (
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleResend}
                        disabled={resending}
                        style={{ marginTop: 'var(--space-6)', width: '100%' }}
                    >
                        {resending ? 'Sending...' : 'Send Verification Code'}
                    </button>
                )}

                <button
                    className="btn btn-ghost"
                    onClick={handleLogout}
                    style={{ marginTop: 'var(--space-3)', width: '100%' }}
                >
                    Sign out
                </button>

                <div className="auth-footer">
                    Wrong email? <Link to="/signup">Create a new account</Link>
                </div>
            </div>
        </div>
    );
}
