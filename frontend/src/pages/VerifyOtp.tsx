import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

export function VerifyOtp() {
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
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

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // digits only
        const newDigits = [...digits];
        newDigits[index] = value.slice(-1); // take last char
        setDigits(newDigits);

        // Auto-advance to next input
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
        for (let i = 0; i < pasted.length; i++) {
            newDigits[i] = pasted[i];
        }
        setDigits(newDigits);
        // Focus last filled or next empty
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

    const isComplete = digits.every((d) => d !== '');

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: 440, textAlign: 'center' }}>
                <div style={{ marginBottom: 'var(--space-2)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--text-secondary)' }}>lock</span>
                </div>
                <h1>Check your email</h1>
                <p>
                    We sent a 6-digit code to{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>{maskedEmail || pendingEmail}</strong>
                </p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-6)' }}>
                    {/* OTP Input Boxes */}
                    <div className="otp-container">
                        {digits.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => { inputRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                className={`otp-input ${digit ? 'filled' : ''}`}
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                onPaste={i === 0 ? handlePaste : undefined}
                                autoComplete="one-time-code"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading || !isComplete}
                        style={{ marginTop: 'var(--space-6)', width: '100%' }}
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <div style={{ marginTop: 'var(--space-6)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                    Didn't receive the code?{' '}
                    {countdown > 0 ? (
                        <span>Resend in <strong style={{ color: 'var(--text-secondary)' }}>{countdown}s</strong></span>
                    ) : (
                        <button
                            onClick={handleResend}
                            className="auth-link"
                            disabled={loading}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                            Resend OTP
                        </button>
                    )}
                </div>

                <div className="auth-footer">
                    Wrong email? <Link to="/signup">Go back</Link>
                </div>
            </div>
        </div>
    );
}
