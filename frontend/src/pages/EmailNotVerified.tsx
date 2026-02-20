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
                <div style={{ marginBottom: 'var(--space-2)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--text-secondary)' }}>email</span>
                </div>
                <h1>Verify your email</h1>
                Your email address hasn't been verified yet. Please verify to access your workspace.

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
                        background: 'var(--success-light)',
                        border: '1px solid rgba(52, 211, 153, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--success)',
                        fontSize: 'var(--font-size-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-1)',
                        justifyContent: 'center',
                    }}>
                        <span className="material-symbols-outlined icon-sm icon-filled">check_circle</span>
                        Verification code sent! Redirecting…
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
