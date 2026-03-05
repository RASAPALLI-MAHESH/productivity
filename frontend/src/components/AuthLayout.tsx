import { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
    error?: string | null;
    footer?: ReactNode;
}

export function AuthLayout({ children, title, subtitle, error, footer }: AuthLayoutProps) {
    return (
        <div className="auth-container">
            <div className="auth-card animate-fade-in-up">
                <div className="auth-header-logo">
                    <div className="brand-logo-icon-center"></div>
                </div>

                <div className="auth-card-header">
                    <h2>{title}</h2>
                    <p>{subtitle}</p>
                </div>

                {error && <div className="auth-error animate-slide-down">{error}</div>}

                <div className="auth-form-container">
                    {children}
                </div>

                {footer && (
                    <div className="auth-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
