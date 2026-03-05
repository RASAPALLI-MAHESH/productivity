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
            {/* Split Pane: Brand Section (Hidden on Mobile) */}
            <div className="auth-brand-pane">
                <div className="auth-brand-grid-mesh"></div>
                <div className="auth-brand-illustration"></div>
                
                <div className="auth-brand-content animate-slide-up-fade">
                    <div className="auth-header-logo stagger-1" style={{ justifyContent: 'flex-start' }}>
                        <div className="brand-logo-icon-center" style={{ width: 48, height: 48 }}></div>
                    </div>
                    <h1 className="stagger-2">Unlock your best work.</h1>
                    <p className="stagger-3">
                        Experience the next generation of productivity. Everything you need to focus, execute, and deliver.
                    </p>
                </div>
            </div>

            {/* Split Pane: Form Section */}
            <div className="auth-form-pane">
                <div className="auth-card">
                    <div className="auth-card-header animate-slide-up-fade stagger-1">
                        <h2>{title}</h2>
                        <p>{subtitle}</p>
                    </div>

                    {error && <div className="auth-error animate-slide-down delay-1">{error}</div>}

                    <div className="auth-form-container">
                        {children}
                    </div>

                    {footer && (
                        <div className="auth-footer animate-slide-up-fade stagger-4">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
