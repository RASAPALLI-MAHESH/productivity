import { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
    error?: string | null;
    footer?: ReactNode;
    icon?: ReactNode;
}

export function AuthLayout({ children, title, subtitle, error, footer, icon }: AuthLayoutProps) {
    return (
        <div className="auth-container">
            {/* Split Pane: Brand Section (Hidden on Mobile) */}
            <div className="auth-brand-pane">
                <div className="auth-brand-grid-mesh"></div>
                <div className="auth-brand-illustration"></div>

                <div className="auth-brand-content animate-slide-up-fade">
                    <div className="auth-header-logo animate-slide-up-fade stagger-1" style={{ justifyContent: 'flex-start', position: 'absolute', top: 40, left: 40, margin: 0 }}>
                        <div className="brand-logo-icon-center" style={{
                            width: 32,
                            height: 32,
                            background: 'linear-gradient(135deg, #0F172A, #1E293B)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}></div>
                    </div>
                    <h1 className="animate-slide-up-fade stagger-2">Unlock your best work.</h1>
                    <p className="animate-slide-up-fade stagger-3">
                        Experience the next generation of productivity. Everything you need to focus, execute, and deliver.
                    </p>
                    <div className="auth-brand-showcase">
                        <div className="auth-brand-showcase-main">
                            <div className="auth-brand-showcase-header">
                                <span className="auth-brand-showcase-title">Today&apos;s focus board</span>
                                <span className="auth-brand-showcase-pill">
                                    <span className="auth-brand-showcase-pill-dot" />
                                    Live progress
                                </span>
                            </div>
                            <div className="auth-brand-showcase-grid">
                                <div className="auth-brand-showcase-cell filled" />
                                <div className="auth-brand-showcase-cell filled" />
                                <div className="auth-brand-showcase-cell" />
                                <div className="auth-brand-showcase-cell filled" />
                                <div className="auth-brand-showcase-cell" />
                                <div className="auth-brand-showcase-cell filled" />
                                <div className="auth-brand-showcase-cell" />
                                <div className="auth-brand-showcase-cell" />
                            </div>
                            <div className="auth-brand-showcase-footer">
                                <div className="auth-showcase-metric">
                                    <span className="auth-showcase-metric-label">Habits completed</span>
                                    <span className="auth-showcase-metric-value">12/15</span>
                                    <span className="auth-showcase-metric-sub">+32% vs last week</span>
                                </div>
                                <div className="auth-showcase-metric">
                                    <span className="auth-showcase-metric-label">Deep work time</span>
                                    <span className="auth-showcase-metric-value">3.4h</span>
                                </div>
                            </div>
                        </div>
                        <div className="auth-brand-showcase-side">
                            <div className="auth-showcase-side-card">
                                <div className="auth-showcase-side-meta">
                                    <span className="auth-showcase-side-label">Morning routine</span>
                                    <span className="auth-showcase-side-caption">3 stacked habits, one tap</span>
                                </div>
                                <div className="auth-showcase-side-pill auth-showcase-side-pill--blue">
                                    Smart streaks
                                </div>
                            </div>
                            <div className="auth-showcase-side-card">
                                <div className="auth-showcase-side-meta">
                                    <span className="auth-showcase-side-label">Weekly momentum</span>
                                    <span className="auth-showcase-side-caption">Visual feedback that nudges you</span>
                                </div>
                                <div className="auth-showcase-side-pill auth-showcase-side-pill--emerald">
                                    Focus mode
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Pane: Form Section */}
            <div className="auth-form-pane">
                <div className="auth-card">
                    <div className="auth-card-inner">
                        <div className="auth-card-header animate-slide-up-fade stagger-1">
                            {icon && <div className="auth-card-icon">{icon}</div>}
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
        </div>
    );
}
