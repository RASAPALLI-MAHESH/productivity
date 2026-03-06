import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export function Landing() {
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(el => observerRef.current?.observe(el));

        return () => observerRef.current?.disconnect();
    }, []);

    return (
        <div className="landing-container">
            <nav className="landing-nav animate-on-scroll">
                <div className="landing-nav-logo">
                    <div className="landing-logo-icon"></div>
                    <span>Productiv</span>
                </div>
                <div className="landing-nav-actions">
                    <Link to="/login" className="landing-btn-ghost">Sign In</Link>
                    <Link to="/signup" className="landing-btn-primary">Get Started</Link>
                </div>
            </nav>

            <header className="landing-hero animate-on-scroll delay-1">
                <div className="landing-hero-content">
                    <div className="landing-badge">✨ The new standard for productivity</div>
                    <h1 className="landing-title">
                        Do your best work,<br />
                        <span className="text-gradient">effortlessly.</span>
                    </h1>
                    <p className="landing-subtitle">
                        Productiv brings your tasks, habits, and deadlines into one
                        beautiful, high-performance workspace designed for flow state.
                    </p>
                    <div className="landing-hero-actions">
                        <Link to="/signup" className="landing-btn-primary large">Start for free</Link>
                        <Link to="/login" className="landing-btn-secondary large">View demo</Link>
                    </div>
                </div>

                <div className="landing-hero-visual animate-on-scroll delay-2">
                    <div className="dashboard-mockup">
                        <div className="mockup-sidebar"></div>
                        <div className="mockup-main">
                            <div className="mockup-header"></div>
                            <div className="mockup-content">
                                <div className="mockup-card"></div>
                                <div className="mockup-card delay-1 animated-card"></div>
                                <div className="mockup-card delay-2 animated-card"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <section className="landing-features">
                <div className="landing-sticky-container">
                    <div className="sticky-content">
                        <h2 className="animate-on-scroll">Everything you need. <br />Nothing you don't.</h2>
                        <ul className="feature-list">
                            <li className="animate-on-scroll delay-1">
                                <h3>Lightning Fast Tasks</h3>
                                <p>Keyboard-first design. Sub-100ms interactions built for ultimate speed and precision.</p>
                            </li>
                            <li className="animate-on-scroll delay-2">
                                <h3>Deep Habit Tracking</h3>
                                <p>Beautiful heatmaps and analytics to keep you consistent on the habits that matter.</p>
                            </li>
                            <li className="animate-on-scroll delay-3">
                                <h3>Smart Deadlines</h3>
                                <p>Visual timelines mapping your entire schedule so you never miss a beat or feel overwhelmed.</p>
                            </li>
                        </ul>
                    </div>
                    <div className="sticky-visuals">
                        <div className="visual-card animate-on-scroll delay-1">
                            <div className="visual-card-inner task-visual">
                                {/* Abstract representation of tasks */}
                                <div className="abstract-row" style={{ width: '80%' }}></div>
                                <div className="abstract-row" style={{ width: '100%' }}></div>
                                <div className="abstract-row" style={{ width: '60%' }}></div>
                                <div className="abstract-row" style={{ width: '90%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="landing-footer animate-on-scroll">
                <div className="landing-nav-logo">
                    <div className="landing-logo-icon"></div>
                    <span>Productiv</span>
                </div>
                <p className="footer-text">Built for individuals who demand the best.</p>
            </footer>
        </div>
    );
}
