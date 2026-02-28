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
            {/* Left — Elite Branding (desktop only) */}
            <div className="auth-branding">
                <div className="auth-branding-content">
                    <div className="brand-header">
                        <div className="brand-logo-icon"></div>
                        <span className="brand-name">Productiv</span>
                    </div>

                    <div className="brand-messaging animate-slide-up">
                        <h1>
                            Plan, track, and ship
                            <br />
                            your most important work.
                            <br />
                            <span className="text-gradient">Every day.</span>
                        </h1>
                    </div>

                    <div className="brand-trust-signals animate-slide-up delay-1">
                        <div className="avatars-row">
                            <div className="avatar"></div>
                            <div className="avatar"></div>
                            <div className="avatar"></div>
                            <div className="avatar"></div>
                        </div>
                        <p>Trusted by 12,000+ professionals</p>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="brand-glow"></div>
            </div>

            {/* Right — Auth Card Area */}
            <div className="auth-content">
                <div className="auth-mobile-header">
                    <div className="brand-logo-icon"></div>
                    <span className="brand-name">Productiv</span>
                </div>

                <div className="auth-card animate-fade-in-up">
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
        </div>
    );
}
