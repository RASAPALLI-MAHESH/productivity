import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AuthLayout } from '../components/AuthLayout';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

// Circumference of the countdown ring (r=8)
const RING_CIRCUMFERENCE = 2 * Math.PI * 8; // ≈ 50.27

export function VerifyOtp() {
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
    const [hasError, setHasError] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const { verifyOtp, resendOtp, loading, error, clearError, pendingEmail, maskedEmail, authStep } = useAuthStore();
    const navigate = useNavigate();

    // Redirect if no pending email
    useEffect(() => {
        if (!pendingEmail && authStep !== 'otp-verify' && authStep !== 'forgot-otp') {
            navigate('/signup');
        }
    }, [pendingEmail, authStep, navigate]);

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setInterval(() => setCountdown((c) => c - 1), 1000);
        return () => clearInterval(t);
    }, [countdown]);

    // Auto-focus first input
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Flash error state on new error
    useEffect(() => {
        if (error) {
            setHasError(true);
            const t = setTimeout(() => setHasError(false), 600);
            return () => clearTimeout(t);
        }
    }, [error]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newDigits = [...digits];
        newDigits[index] = value.slice(-1);
        setDigits(newDigits);
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (!pasted) return;
        const newDigits = [...digits];
        for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i];
        setDigits(newDigits);
        const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        const otp = digits.join('');
        if (otp.length !== OTP_LENGTH || !pendingEmail) return;

        try {
            if (authStep === 'forgot-otp') {
                const { verifyResetOtp } = useAuthStore.getState();
                await verifyResetOtp(pendingEmail, otp);
                navigate('/reset-password');
            } else {
                await verifyOtp(pendingEmail, otp);
                navigate('/');
            }
        } catch {
            // error set in store
        }
    };

    const handleResend = async () => {
        if (countdown > 0 || !pendingEmail) return;
        clearError();
        try {
            await resendOtp(pendingEmail);
            setCountdown(RESEND_COOLDOWN);
            setDigits(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        } catch {
            // error set in store
        }
    };

    const filledCount = digits.filter((d) => d !== '').length;
    const isComplete = filledCount === OTP_LENGTH;

    // Ring progress: goes from full (0 offset) to empty (full circumference) as countdown decreases
    const ringOffset = RING_CIRCUMFERENCE * (1 - countdown / RESEND_COOLDOWN);

    const footerNode = (
        <>
            Wrong email?{' '}
            <Link to="/signup" className="auth-link">Go back</Link>
        </>
    );

    const emailIcon = (
        <div className="otp-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="M2 7l10 7 10-7" />
            </svg>
        </div>
    );

    return (
        <AuthLayout
            title="Check your email"
            subtitle={`We sent a 6-digit code to ${maskedEmail || pendingEmail}`}
            error={error}
            footer={footerNode}
            icon={emailIcon}
        >
            <form onSubmit={handleSubmit} className="animate-slide-up-fade stagger-2">
                {/* OTP digit inputs */}
                <div className="otp-container">
                    {digits.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => { inputRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className={`otp-input${digit ? ' filled' : ''}${hasError ? ' otp-error' : ''}`}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onPaste={handlePaste}
                            autoComplete="one-time-code"
                            aria-label={`Digit ${i + 1}`}
                        />
                    ))}
                </div>

                {/* Progress dots */}
                <div className="otp-progress" aria-hidden="true">
                    {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                        <div
                            key={i}
                            className={`otp-progress-dot${i < filledCount ? ' active' : ''}`}
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || !isComplete}
                >
                    {loading ? (
                        <>Verifying&hellip;</>
                    ) : (
                        <>Verify Email</>
                    )}
                </button>
            </form>

            {/* Resend row */}
            <div className="otp-resend-row animate-slide-up-fade stagger-3">
                Didn&apos;t receive the code?&nbsp;
                {countdown > 0 ? (
                    <span className="otp-timer-wrap">
                        <svg className="otp-timer-ring" viewBox="0 0 20 20">
                            <circle className="otp-timer-ring-track" cx="10" cy="10" r="8" />
                            <circle
                                className="otp-timer-ring-fill"
                                cx="10" cy="10" r="8"
                                strokeDasharray={RING_CIRCUMFERENCE}
                                strokeDashoffset={ringOffset}
                            />
                        </svg>
                        <span className="otp-countdown">{countdown}s</span>
                    </span>
                ) : (
                    <button
                        onClick={handleResend}
                        className="auth-link"
                        disabled={loading}
                        type="button"
                    >
                        Resend code
                    </button>
                )}
            </div>
        </AuthLayout>
    );
}
