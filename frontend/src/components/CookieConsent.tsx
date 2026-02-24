import { useState, useEffect } from 'react';

type ConsentStatus = 'pending' | 'accepted' | 'declined';

const CONSENT_KEY = 'cookie_consent';

export function useCookieConsent() {
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentStatus | null;
    return stored || 'pending';
}

export function CookieConsent() {
    const [status, setStatus] = useState<ConsentStatus>(() => {
        return (localStorage.getItem(CONSENT_KEY) as ConsentStatus) || 'pending';
    });
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (status === 'pending') {
            // Small delay so the banner slides in smoothly after page load
            const timer = setTimeout(() => setVisible(true), 800);
            return () => clearTimeout(timer);
        }
    }, [status]);

    if (status !== 'pending') return null;

    const handleAccept = () => {
        localStorage.setItem(CONSENT_KEY, 'accepted');
        setStatus('accepted');
        setVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem(CONSENT_KEY, 'declined');
        setStatus('declined');
        setVisible(false);
    };

    return (
        <div className={`cookie-consent-banner ${visible ? 'visible' : ''}`}>
            <div className="cookie-consent-content">
                <div className="cookie-consent-icon">
                    <span className="material-symbols-outlined">cookie</span>
                </div>
                <div className="cookie-consent-text">
                    <h4>We use cookies</h4>
                    <p>
                        We use essential cookies to keep you signed in and remember your preferences.
                        No tracking or advertising cookies are used.
                    </p>
                </div>
                <div className="cookie-consent-actions">
                    <button className="cookie-btn cookie-btn--decline" onClick={handleDecline}>
                        Decline
                    </button>
                    <button className="cookie-btn cookie-btn--accept" onClick={handleAccept}>
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
