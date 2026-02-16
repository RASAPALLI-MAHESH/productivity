import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const STEPS = ['welcome', 'bio', 'ready'] as const;
type Step = typeof STEPS[number];

export function Onboarding() {
    const [step, setStep] = useState<Step>('welcome');
    const [bio, setBio] = useState('');
    const { completeOnboarding, loading, error, profile, user } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await completeOnboarding(bio);
            setStep('ready');
        } catch {
            // error handled in store
        }
    };

    const displayName = profile?.displayName || user?.displayName || 'there';

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: 480, textAlign: 'center' }}>
                {/* Step indicators */}
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: 'var(--space-2)',
                    marginBottom: 'var(--space-6)'
                }}>
                    {STEPS.map((s, i) => (
                        <div key={s} style={{
                            width: i === STEPS.indexOf(step) ? 32 : 10,
                            height: 4,
                            borderRadius: 'var(--radius-full)',
                            background: i <= STEPS.indexOf(step) ? 'var(--accent)' : 'var(--border)',
                            transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }} />
                    ))}
                </div>

                {step === 'welcome' && (
                    <div style={{ animation: 'modalSlideUp 400ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-4)' }}>⚡</div>
                        <h1>Welcome, {displayName}!</h1>
                        <p style={{ marginBottom: 'var(--space-6)' }}>
                            Let's set up your productivity workspace in 30 seconds.
                        </p>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => setStep('bio')}
                            style={{ width: '100%' }}
                        >
                            Let's get started →
                        </button>
                    </div>
                )}

                {step === 'bio' && (
                    <div style={{ animation: 'modalSlideUp 400ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-4)' }}>🎯</div>
                        <h1>What drives you?</h1>
                        <p>Tell us about your goals so we can personalize your experience.</p>

                        {error && <div className="auth-error">{error}</div>}

                        <form onSubmit={handleSubmit} style={{ textAlign: 'left', marginTop: 'var(--space-6)' }}>
                            <div className="input-group">
                                <label className="input-label" htmlFor="bio">Your goals & motivation</label>
                                <textarea
                                    id="bio"
                                    className="input"
                                    rows={4}
                                    placeholder="I want to build better habits, stay on top of my tasks, and make progress every day..."
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    required
                                    style={{ marginTop: 'var(--space-2)' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setStep('welcome')}
                                    style={{ flex: '0 0 auto' }}
                                >
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    disabled={loading || !bio.trim()}
                                    style={{ flex: 1 }}
                                >
                                    {loading ? 'Saving...' : 'Complete Setup →'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {step === 'ready' && (
                    <div style={{ animation: 'bounceIn 500ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🎉</div>
                        <h1>You're all set!</h1>
                        <p style={{ marginBottom: 'var(--space-6)' }}>
                            Your workspace is ready. Start by creating your first task or building a daily habit.
                        </p>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => navigate('/')}
                            style={{ width: '100%' }}
                        >
                            Go to Dashboard 🚀
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
