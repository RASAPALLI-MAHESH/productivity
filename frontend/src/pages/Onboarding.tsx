import { useState, useCallback, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// ─── Step definitions ──────────────────────────────
const STEPS = ['welcome', 'focus', 'style', 'goals', 'ready'] as const;
type Step = (typeof STEPS)[number];

interface FocusArea {
    id: string;
    label: string;
    icon: string;
}

interface WorkStyle {
    id: string;
    label: string;
    desc: string;
    icon: string;
}

const FOCUS_AREAS: FocusArea[] = [
    { id: 'work', label: 'Work & Projects', icon: '💼' },
    { id: 'health', label: 'Health & Fitness', icon: '💪' },
    { id: 'learning', label: 'Learning & Growth', icon: '📚' },
    { id: 'personal', label: 'Personal Goals', icon: '🎯' },
    { id: 'finance', label: 'Finance & Budgeting', icon: '💰' },
    { id: 'creative', label: 'Creative Projects', icon: '🎨' },
];

const WORK_STYLES: WorkStyle[] = [
    { id: 'morning', label: 'Early Bird', desc: 'Most productive before noon', icon: '🌅' },
    { id: 'night', label: 'Night Owl', desc: 'Peak focus after dark', icon: '🌙' },
    { id: 'flexible', label: 'Flexible', desc: 'Adapts to the day', icon: '⚡' },
];

// ─── Component ──────────────────────────────────────
export function Onboarding() {
    const [currentStep, setCurrentStep] = useState<Step>('welcome');
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');
    const [animKey, setAnimKey] = useState(0);

    // Form state
    const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
    const [selectedStyle, setSelectedStyle] = useState<string>('');
    const [bio, setBio] = useState('');

    const { completeOnboarding, loading, error, profile, user } = useAuthStore();
    const navigate = useNavigate();

    const stepIndex = STEPS.indexOf(currentStep);
    const progress = ((stepIndex + 1) / STEPS.length) * 100;
    const displayName = profile?.displayName || user?.displayName || 'there';

    const goNext = useCallback(() => {
        const nextIndex = stepIndex + 1;
        if (nextIndex < STEPS.length) {
            setDirection('forward');
            setAnimKey((k) => k + 1);
            setCurrentStep(STEPS[nextIndex]);
        }
    }, [stepIndex]);

    const goBack = useCallback(() => {
        const prevIndex = stepIndex - 1;
        if (prevIndex >= 0) {
            setDirection('back');
            setAnimKey((k) => k + 1);
            setCurrentStep(STEPS[prevIndex]);
        }
    }, [stepIndex]);

    const toggleFocus = (id: string) => {
        setSelectedFocus((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        );
    };

    const handleComplete = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await completeOnboarding(bio);
            setDirection('forward');
            setAnimKey((k) => k + 1);
            setCurrentStep('ready');
        } catch {
            // error handled in store
        }
    };

    const handleFinish = () => {
        navigate('/tasks');
    };

    // Can proceed to next step?
    const canProceed = (() => {
        switch (currentStep) {
            case 'welcome': return true;
            case 'focus': return selectedFocus.length > 0;
            case 'style': return selectedStyle !== '';
            case 'goals': return bio.trim().length > 0;
            case 'ready': return true;
            default: return false;
        }
    })();

    const animClass = direction === 'forward' ? 'step-enter' : 'step-enter-back';

    return (
        <div className="onboarding">
            {/* ── Top Bar ── */}
            <div className="onboarding-topbar">
                <div className="onboarding-logo">
                    <div className="onboarding-logo-icon"></div>
                    <span>Productiv</span>
                </div>
                {currentStep !== 'ready' && (
                    <button
                        className="onboarding-skip"
                        onClick={() => {
                            completeOnboarding(bio || 'Skipped onboarding');
                            navigate('/tasks');
                        }}
                    >
                        Skip for now
                    </button>
                )}
            </div>

            {/* ── Progress ── */}
            <div className="onboarding-progress">
                <div className="onboarding-progress-track">
                    <div
                        className="onboarding-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="onboarding-step-dots">
                    {STEPS.map((s, i) => (
                        <div
                            key={s}
                            className={`onboarding-dot ${i === stepIndex ? 'active' :
                                    i < stepIndex ? 'completed' : ''
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* ── Step Content ── */}
            <div className="onboarding-body">
                {/* Step 1: Welcome */}
                {currentStep === 'welcome' && (
                    <div key={animKey} className={`onboarding-step ${animClass}`}>
                        <div className="onboarding-illustration welcome">
                            <span className="material-symbols-outlined">waving_hand</span>
                        </div>
                        <h1 className="onboarding-title">
                            Welcome, {displayName}!
                        </h1>
                        <p className="onboarding-subtitle">
                            Let's personalize your workspace in under a minute.
                            We'll help you get the most out of Productiv from day one.
                        </p>
                    </div>
                )}

                {/* Step 2: Focus Areas */}
                {currentStep === 'focus' && (
                    <div key={animKey} className={`onboarding-step ${animClass}`}>
                        <div className="onboarding-illustration focus">
                            <span className="material-symbols-outlined">category</span>
                        </div>
                        <h1 className="onboarding-title">
                            What do you want to focus on?
                        </h1>
                        <p className="onboarding-subtitle">
                            Select the areas that matter most to you. Pick as many as you like.
                        </p>
                        <div className="onboarding-chips">
                            {FOCUS_AREAS.map((area) => (
                                <button
                                    key={area.id}
                                    className={`focus-chip ${selectedFocus.includes(area.id) ? 'selected' : ''}`}
                                    onClick={() => toggleFocus(area.id)}
                                    type="button"
                                >
                                    <span className="chip-icon">{area.icon}</span>
                                    <span>{area.label}</span>
                                    <span className="chip-check material-symbols-outlined">check_circle</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Work Style */}
                {currentStep === 'style' && (
                    <div key={animKey} className={`onboarding-step ${animClass}`}>
                        <div className="onboarding-illustration style">
                            <span className="material-symbols-outlined">schedule</span>
                        </div>
                        <h1 className="onboarding-title">
                            How do you work best?
                        </h1>
                        <p className="onboarding-subtitle">
                            This helps us prioritize your tasks and suggest optimal focus times.
                        </p>
                        <div className="onboarding-style-cards">
                            {WORK_STYLES.map((ws) => (
                                <button
                                    key={ws.id}
                                    className={`style-card ${selectedStyle === ws.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedStyle(ws.id)}
                                    type="button"
                                >
                                    <span className="style-card-icon">{ws.icon}</span>
                                    <span className="style-card-label">{ws.label}</span>
                                    <span className="style-card-desc">{ws.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Goals */}
                {currentStep === 'goals' && (
                    <div key={animKey} className={`onboarding-step ${animClass}`}>
                        <div className="onboarding-illustration goals">
                            <span className="material-symbols-outlined">flag</span>
                        </div>
                        <h1 className="onboarding-title">
                            What drives you?
                        </h1>
                        <p className="onboarding-subtitle">
                            Tell us about your goals so we can personalize your experience.
                        </p>

                        {error && <div className="auth-error" style={{ marginTop: 16, width: '100%', maxWidth: 480 }}>{error}</div>}

                        <form onSubmit={handleComplete} id="goals-form" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <div className="onboarding-textarea-wrap">
                                <label htmlFor="onboarding-bio">Your goals &amp; motivation</label>
                                <textarea
                                    id="onboarding-bio"
                                    className="onboarding-textarea"
                                    rows={4}
                                    placeholder="I want to build better habits, stay on top of my tasks, and make progress every day..."
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                        </form>
                    </div>
                )}

                {/* Step 5: Ready */}
                {currentStep === 'ready' && (
                    <div key={animKey} className={`onboarding-step ${animClass}`}>
                        <div className="onboarding-illustration ready">
                            <span className="material-symbols-outlined">rocket_launch</span>
                        </div>
                        <h1 className="onboarding-title">
                            You're all set!
                        </h1>
                        <p className="onboarding-subtitle">
                            Your workspace is ready. Here's what you can do:
                        </p>
                        <div className="ready-features">
                            <div className="ready-feature">
                                <span className="material-symbols-outlined">check_circle</span>
                                Create tasks
                            </div>
                            <div className="ready-feature">
                                <span className="material-symbols-outlined">check_circle</span>
                                Track habits
                            </div>
                            <div className="ready-feature">
                                <span className="material-symbols-outlined">check_circle</span>
                                Set deadlines
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Bottom Actions ── */}
            <div className="onboarding-actions">
                {stepIndex > 0 && currentStep !== 'ready' ? (
                    <button className="onboarding-btn-back" onClick={goBack} type="button">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back
                    </button>
                ) : (
                    <div className="spacer" />
                )}

                {currentStep === 'goals' ? (
                    <button
                        className="onboarding-btn-next"
                        type="submit"
                        form="goals-form"
                        disabled={!canProceed || loading}
                    >
                        {loading ? 'Setting up...' : 'Complete Setup'}
                        {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
                    </button>
                ) : currentStep === 'ready' ? (
                    <button className="onboarding-btn-next" onClick={handleFinish} type="button">
                        Start Using Productiv
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                ) : (
                    <button
                        className="onboarding-btn-next"
                        onClick={goNext}
                        disabled={!canProceed}
                        type="button"
                    >
                        Continue
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                )}
            </div>
        </div>
    );
}
