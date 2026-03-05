import { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            const isDynamicImportError = this.state.error?.message?.includes('dynamically imported module')
                || this.state.error?.message?.includes('Failed to fetch');

            return (
                <div style={{
                    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-primary, #0a0a0f)',
                    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
                    padding: '24px',
                }}>
                    <div style={{
                        maxWidth: 460, width: '100%', textAlign: 'center',
                        animation: 'errorFadeIn 0.5s ease-out',
                    }}>
                        {/* Animated icon */}
                        <div style={{
                            width: 88, height: 88, borderRadius: '50%', margin: '0 auto 28px',
                            background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(245,158,11,0.10))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(239,68,68,0.2)',
                            boxShadow: '0 0 40px rgba(239,68,68,0.08)',
                            animation: 'errorPulse 2.5s ease-in-out infinite',
                        }}>
                            <span className="material-symbols-outlined" style={{
                                fontSize: 40, color: '#f59e0b',
                                filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.4))',
                            }}>
                                cloud_off
                            </span>
                        </div>

                        {/* Title */}
                        <h1 style={{
                            fontSize: 22, fontWeight: 700, margin: '0 0 8px',
                            color: 'var(--text-primary, #e5e5e5)',
                            letterSpacing: '-0.3px',
                        }}>
                            {isDynamicImportError ? 'Connection Lost' : 'Something went wrong'}
                        </h1>

                        {/* Subtitle */}
                        <p style={{
                            fontSize: 14, lineHeight: 1.6, margin: '0 0 24px',
                            color: 'var(--text-secondary, #9ca3af)',
                            maxWidth: 340, marginLeft: 'auto', marginRight: 'auto',
                        }}>
                            {isDynamicImportError
                                ? "We couldn't load part of the application. This usually happens due to a network interruption or a new update being deployed."
                                : 'An unexpected error occurred. Our team has been notified. Please try reloading the page.'
                            }
                        </p>

                        {/* Error detail (collapsible, subtle) */}
                        <details style={{
                            marginBottom: 28, textAlign: 'left',
                            background: 'var(--bg-secondary, rgba(255,255,255,0.03))',
                            border: '1px solid var(--border, rgba(255,255,255,0.06))',
                            borderRadius: 10, overflow: 'hidden',
                        }}>
                            <summary style={{
                                padding: '10px 16px', cursor: 'pointer', fontSize: 12,
                                color: 'var(--text-tertiary, #6b7280)', fontWeight: 500,
                                userSelect: 'none', listStyle: 'none',
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>code</span>
                                Technical Details
                            </summary>
                            <div style={{
                                padding: '12px 16px', borderTop: '1px solid var(--border, rgba(255,255,255,0.06))',
                                fontSize: 12, fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                color: 'var(--text-tertiary, #6b7280)',
                                wordBreak: 'break-all', lineHeight: 1.5,
                            }}>
                                {this.state.error?.message || 'Unknown error'}
                            </div>
                        </details>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    padding: '12px 28px', borderRadius: 10, border: 'none',
                                    background: 'var(--primary, #6366f1)', color: '#fff',
                                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                                    transition: 'transform 0.15s, box-shadow 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.3)'; }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
                                Reload Page
                            </button>
                            <button
                                onClick={() => { window.location.href = '/'; }}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    padding: '12px 28px', borderRadius: 10,
                                    border: '1px solid var(--border, rgba(255,255,255,0.1))',
                                    background: 'transparent',
                                    color: 'var(--text-secondary, #9ca3af)',
                                    fontSize: 14, fontWeight: 500, cursor: 'pointer',
                                    transition: 'border-color 0.15s, color 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary, #6366f1)'; e.currentTarget.style.color = 'var(--text-primary, #e5e5e5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border, rgba(255,255,255,0.1))'; e.currentTarget.style.color = 'var(--text-secondary, #9ca3af)'; }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>home</span>
                                Go Home
                            </button>
                        </div>

                        {/* Branding footer */}
                        <p style={{
                            marginTop: 40, fontSize: 11, color: 'var(--text-tertiary, #4b5563)',
                            letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 500,
                        }}>
                            Productiv
                        </p>
                    </div>

                    {/* Animations */}
                    <style>{`
                        @keyframes errorFadeIn {
                            from { opacity: 0; transform: translateY(16px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes errorPulse {
                            0%, 100% { box-shadow: 0 0 40px rgba(239,68,68,0.08); }
                            50% { box-shadow: 0 0 50px rgba(239,68,68,0.15); }
                        }
                    `}</style>
                </div>
            );
        }
        return this.props.children;
    }
}
