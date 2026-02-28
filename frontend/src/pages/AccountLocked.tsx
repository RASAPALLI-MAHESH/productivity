import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AuthLayout } from '../components/AuthLayout';

export function AccountLocked() {
    const { user } = useAuthStore();

    // Calculate remaining lock time
    const lockedUntil = user?.lockedUntil ? new Date(user.lockedUntil) : null;
    const now = new Date();
    const minutesRemaining = lockedUntil
        ? Math.max(0, Math.ceil((lockedUntil.getTime() - now.getTime()) / 60000))
        : 30;

    const footerNode = (
        <>
            Need help? <a href="mailto:support@productiv.app" className="auth-link">Contact Support</a>
        </>
    );

    return (
        <AuthLayout
            title="Account temporarily locked"
            subtitle="Too many failed login attempts. Your account has been temporarily locked for security."
            footer={footerNode}
        >
            <div style={{
                background: 'var(--error-light)',
                border: '1px solid rgba(248, 113, 113, 0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-4)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--critical)', marginBottom: 'var(--space-2)' }}>
                    Time remaining
                </div>
                <div style={{
                    fontSize: '2rem', fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                }}>
                    {minutesRemaining} min
                </div>
            </div>

            <div style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-muted)',
                marginBottom: 'var(--space-6)',
                lineHeight: 1.6,
            }}>
                <p>If this wasn't you, we recommend:</p>
                <ul style={{ textAlign: 'left', paddingLeft: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                    <li>Resetting your password immediately</li>
                    <li>Enabling two-factor authentication</li>
                    <li>Contacting support if suspicious activity continues</li>
                </ul>
            </div>

            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                    Reset Password
                </button>
            </Link>
        </AuthLayout>
    );
}
