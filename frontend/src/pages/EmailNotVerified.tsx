import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AuthLayout } from '../components/AuthLayout';

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

    const footerNode = (
        <>
            Wrong email? <Link to="/signup">Create a new account</Link>
        </>
    );

    return (
        <AuthLayout
            title="Verify your email"
            subtitle="Your email address hasn't been verified yet. Please verify to access your workspace."
            error={error}
            footer={footerNode}
        >
            {pendingEmail && (
                <div style={{
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3) var(--space-4)',
                    marginBottom: 'var(--space-4)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    textAlign: 'center'
                }}>
                    {pendingEmail}
                </div>
            )}

            {sent ? (
                <div style={{
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
                    marginBottom: 'var(--space-4)'
                }}>
                    <span className="material-symbols-outlined icon-sm icon-filled">check_circle</span>
                    Verification code sent! Redirecting…
                </div>
            ) : (
                <button
                    className="btn-primary"
                    onClick={handleResend}
                    disabled={resending}
                    style={{ marginBottom: 'var(--space-2)' }}
                >
                    {resending ? 'Sending...' : 'Send Verification Code'}
                </button>
            )}

            <button
                className="btn-secondary"
                onClick={handleLogout}
                style={{ width: '100%', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 'var(--radius-lg)' }}
            >
                Sign out
            </button>
        </AuthLayout>
    );
}
