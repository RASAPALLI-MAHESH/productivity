import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function AccountLocked() {
    const { user } = useAuthStore();

    // Calculate remaining lock time
    const lockedUntil = user?.lockedUntil ? new Date(user.lockedUntil) : null;
    const now = new Date();
    const minutesRemaining = lockedUntil
        ? Math.max(0, Math.ceil((lockedUntil.getTime() - now.getTime()) / 60000))
        : 30;

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: 440, textAlign: 'center' }}>
                <div style={{
                    fontSize: '3.5rem', marginBottom: 'var(--space-4)',
                    animation: 'shake 500ms ease-in-out',
                }}>
                    🔒
                </div>
                <h1>Account temporarily locked</h1>
                <p style={{ marginBottom: 'var(--space-4)' }}>
                    Too many failed login attempts. Your account has been temporarily locked for security.
                </p>

                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)',
                    marginBottom: 'var(--space-6)',
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
                    <ul style={{ textAlign: 'left', paddingLeft: 'var(--space-6)', marginTop: 'var(--space-2)' }}>
                        <li>Resetting your password immediately</li>
                        <li>Enabling two-factor authentication</li>
                        <li>Contacting support if suspicious activity continues</li>
                    </ul>
                </div>

                <Link to="/forgot-password" className="btn btn-secondary btn-lg" style={{ display: 'block', width: '100%', textDecoration: 'none' }}>
                    Reset Password
                </Link>

                <div className="auth-footer">
                    Need help? <a href="mailto:support@productiv.app" className="auth-link">Contact Support</a>
                </div>
            </div>
        </div>
    );
}
