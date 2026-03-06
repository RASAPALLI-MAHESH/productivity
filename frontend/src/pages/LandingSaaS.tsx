import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export function LandingSaaS() {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [animatedMetrics, setAnimatedMetrics] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Handle scroll for navbar
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // Intersection Observer for animations
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');

                        // Animate metrics when visible
                        const element = entry.target as HTMLElement;
                        if (element.classList.contains('metric-elite-number')) {
                            const metricId = element.getAttribute('data-metric');
                            if (metricId && !animatedMetrics.has(metricId)) {
                                animateMetric(element, metricId);
                                setAnimatedMetrics(prev => new Set(prev).add(metricId));
                            }
                        }
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        const elements = document.querySelectorAll('.animate-elite-fade-in, .animate-elite-slide-up, .animate-elite-scale-in');
        elements.forEach((el) => observerRef.current?.observe(el));

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observerRef.current?.disconnect();
        };
    }, [animatedMetrics]);

    const animateMetric = (element: HTMLElement, metricId: string) => {
        const metrics: Record<string, { target: number; suffix?: string; duration?: number }> = {
            'users': { target: 10000, suffix: '+', duration: 2000 },
            'tasks': { target: 1000000, suffix: '+', duration: 2500 },
            'uptime': { target: 99.99, suffix: '%', duration: 1500 },
            'rating': { target: 4.9, suffix: '/5', duration: 1800 }
        };

        const metric = metrics[metricId];
        if (!metric) return;

        const { target, suffix = '', duration = 2000 } = metric;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }

            if (metricId === 'rating') {
                element.textContent = current.toFixed(1) + suffix;
            } else if (metricId === 'uptime') {
                element.textContent = current.toFixed(2) + suffix;
            } else {
                element.textContent = Math.floor(current).toLocaleString() + suffix;
            }
        }, 16);
    };

    return (
        <div className="saas-elite">
            {/* Elite Navigation */}
            <nav className={`nav-elite ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-elite-container">
                    <Link to="/" className="nav-elite-logo">
                        <div style={{
                            width: 32,
                            height: 32,
                            background: 'linear-gradient(135deg, #7C5CFF 0%, #5A3DFF 100%)',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: 16
                        }}>
                            P
                        </div>
                        <span>Productiv</span>
                    </Link>

                    <div className="nav-elite-center">
                        <a href="#features" className="nav-elite-link">Features</a>
                        <a href="#habits" className="nav-elite-link">Habits</a>
                        <a href="#deadlines" className="nav-elite-link">Deadlines</a>
                        <a href="#pricing" className="nav-elite-link">Pricing</a>
                    </div>

                    <div className="nav-elite-actions">
                        <Link to="/login" className="btn-elite-ghost">Login</Link>
                        <Link to="/signup" className="btn-elite-primary btn-elite-glow">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="section-elite section-elite-hero">
                <div className="section-elite-container">
                    <div className="grid-elite grid-elite-2" style={{ alignItems: 'center', gap: '80px' }}>
                        <div className="animate-elite-fade-in">
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                background: 'rgba(124, 92, 255, 0.1)',
                                border: '1px solid rgba(124, 92, 255, 0.2)',
                                borderRadius: '9999px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#7C5CFF',
                                marginBottom: '32px'
                            }}>
                                ✨ New: AI-powered productivity insights
                            </div>

                            <h1 className="text-elite-hero" style={{ marginBottom: '24px' }}>
                                Finally, a productivity system that actually works.
                            </h1>

                            <p className="text-elite-body" style={{
                                color: 'var(--text-elite-secondary)',
                                marginBottom: '40px',
                                fontSize: '20px',
                                lineHeight: 1.6
                            }}>
                                Manage tasks, build habits, and track deadlines in one powerful productivity command center designed for focus and speed.
                            </p>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <Link to="/signup" className="btn-elite-primary btn-elite-glow" style={{ fontSize: '16px', padding: '16px 32px' }}>
                                    Get Started Free
                                    <span style={{ fontSize: '18px' }}>→</span>
                                </Link>
                                <Link to="#showcase" className="btn-elite-secondary" style={{ fontSize: '16px', padding: '16px 32px' }}>
                                    See How It Works
                                </Link>
                            </div>
                        </div>

                        <div className="animate-elite-scale-in" style={{ position: 'relative' }}>
                            {/* Dashboard Mockup */}
                            <div style={{
                                background: 'var(--bg-elite-elevated)',
                                border: '1px solid var(--border-elite)',
                                borderRadius: '24px',
                                padding: '32px',
                                boxShadow: 'var(--shadow-elite-xl)',
                                transform: 'perspective(1000px) rotateX(5deg) rotateY(-5deg)',
                                transition: 'transform 0.6s ease'
                            }}>
                                {/* Mock Header */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '24px',
                                    paddingBottom: '16px',
                                    borderBottom: '1px solid var(--border-elite)'
                                }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }}></div>
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }}></div>
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28CA42' }}></div>
                                    </div>
                                    <span style={{ fontSize: '14px', color: 'var(--text-elite-secondary)' }}>Productiv Dashboard</span>
                                </div>

                                {/* Task List */}
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-elite-primary)' }}>Today's Focus</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px',
                                            background: 'var(--bg-elite-surface)',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border-elite)'
                                        }}>
                                            <div style={{ width: 20, height: 20, borderRadius: '4px', background: 'linear-gradient(135deg, #7C5CFF 0%, #5A3DFF 100%)' }}></div>
                                            <span style={{ fontSize: '14px', color: 'var(--text-elite-primary)' }}>Complete project proposal</span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px',
                                            background: 'var(--bg-elite-surface)',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border-elite)'
                                        }}>
                                            <div style={{ width: 20, height: 20, borderRadius: '4px', border: '2px solid var(--border-elite)' }}></div>
                                            <span style={{ fontSize: '14px', color: 'var(--text-elite-primary)' }}>Review design mockups</span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px',
                                            background: 'var(--bg-elite-surface)',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border-elite)'
                                        }}>
                                            <div style={{ width: 20, height: 20, borderRadius: '4px', border: '2px solid var(--border-elite)' }}></div>
                                            <span style={{ fontSize: '14px', color: 'var(--text-elite-primary)' }}>Team standup meeting</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Habit Tracker */}
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-elite-primary)' }}>Habit Streak 🔥 7 days</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                            <div key={i} style={{
                                                aspectRatio: 1,
                                                background: i < 5 ? 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)' : 'var(--bg-elite-surface)',
                                                border: '1px solid var(--border-elite)',
                                                borderRadius: '6px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '10px',
                                                fontWeight: 600,
                                                color: i < 5 ? 'white' : 'var(--text-elite-secondary)'
                                            }}>
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Deadlines */}
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-elite-primary)' }}>Upcoming Deadlines</div>
                                    <div style={{
                                        padding: '12px',
                                        background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.1) 0%, rgba(255, 149, 0, 0.1) 100%)',
                                        border: '1px solid rgba(255, 184, 0, 0.2)',
                                        borderRadius: '12px',
                                        borderLeft: '4px solid #FFB800'
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#FFB800', marginBottom: '4px' }}>Due Tomorrow</div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-elite-primary)' }}>Q1 Marketing Report</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="section-elite">
                <div className="section-elite-container">
                    <div className="trust-elite">
                        <div className="trust-elite-label">Trusted by teams at</div>
                        <div className="trust-elite-logos">
                            <div className="trust-elite-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' }}>
                                Notion
                            </div>
                            <div className="trust-elite-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' }}>
                                Shopify
                            </div>
                            <div className="trust-elite-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' }}>
                                Figma
                            </div>
                            <div className="trust-elite-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' }}>
                                Vercel
                            </div>
                            <div className="trust-elite-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' }}>
                                Stripe
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section-elite" id="features">
                <div className="section-elite-container">
                    <div style={{ textAlign: 'center', marginBottom: '80px' }} className="animate-elite-fade-in">
                        <h2 className="text-elite-h1" style={{ marginBottom: '16px' }}>
                            Designed for Excellence
                        </h2>
                        <p className="text-elite-body" style={{ color: 'var(--text-elite-secondary)', fontSize: '20px', maxWidth: '600px', margin: '0 auto' }}>
                            Powerful features that help you achieve your best work
                        </p>
                    </div>

                    <div className="grid-elite grid-elite-3">
                        <div className="feature-elite animate-elite-slide-up">
                            <div className="feature-elite-icon">⚡</div>
                            <h3 className="feature-elite-title">Lightning Fast</h3>
                            <p className="feature-elite-description">
                                Sub-100ms interactions with keyboard-first design. Built for speed and precision.
                            </p>
                        </div>

                        <div className="feature-elite animate-elite-slide-up" style={{ animationDelay: '100ms' }}>
                            <div className="feature-elite-icon">🔥</div>
                            <h3 className="feature-elite-title">Smart Habits</h3>
                            <p className="feature-elite-description">
                                Build consistent routines with visual streak tracking and intelligent reminders.
                            </p>
                        </div>

                        <div className="feature-elite animate-elite-slide-up" style={{ animationDelay: '200ms' }}>
                            <div className="feature-elite-icon">🎯</div>
                            <h3 className="feature-elite-title">Deadline Intelligence</h3>
                            <p className="feature-elite-description">
                                Never miss important dates with smart deadline tracking and automated insights.
                            </p>
                        </div>

                        <div className="feature-elite animate-elite-slide-up" style={{ animationDelay: '300ms' }}>
                            <div className="feature-elite-icon">⌨️</div>
                            <h3 className="feature-elite-title">Keyboard-First Workflow</h3>
                            <p className="feature-elite-description">
                                Navigate everything with powerful keyboard shortcuts. Never touch your mouse.
                            </p>
                        </div>

                        <div className="feature-elite animate-elite-slide-up" style={{ animationDelay: '400ms' }}>
                            <div className="feature-elite-icon">📊</div>
                            <h3 className="feature-elite-title">Productivity Analytics</h3>
                            <p className="feature-elite-description">
                                Understand your patterns with detailed productivity insights and progress tracking.
                            </p>
                        </div>

                        <div className="feature-elite animate-elite-slide-up" style={{ animationDelay: '500ms' }}>
                            <div className="feature-elite-icon">🎨</div>
                            <h3 className="feature-elite-title">Focus Mode</h3>
                            <p className="feature-elite-description">
                                A distraction-free interface that helps you concentrate on what matters most.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Showcase */}
            <section className="section-elite" id="showcase" style={{ background: 'var(--bg-elite-surface)' }}>
                <div className="section-elite-container">
                    <div style={{ textAlign: 'center', marginBottom: '80px' }} className="animate-elite-fade-in">
                        <h2 className="text-elite-h1" style={{ marginBottom: '16px' }}>
                            Everything you need to stay productive
                        </h2>
                        <p className="text-elite-body" style={{ color: 'var(--text-elite-secondary)', fontSize: '20px', maxWidth: '600px', margin: '0 auto' }}>
                            A unified workspace that adapts to your workflow
                        </p>
                    </div>

                    <div className="animate-elite-scale-in">
                        <div style={{
                            background: 'var(--bg-elite-elevated)',
                            border: '1px solid var(--border-elite)',
                            borderRadius: '24px',
                            padding: '48px',
                            boxShadow: 'var(--shadow-elite-xl)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Large dashboard preview would go here */}
                            <div style={{
                                height: '400px',
                                background: 'var(--bg-elite-surface)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px dashed var(--border-elite)',
                                color: 'var(--text-elite-muted)',
                                fontSize: '18px',
                                fontWeight: 500
                            }}>
                                Interactive Dashboard Preview
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Metrics Section */}
            <section className="section-elite">
                <div className="section-elite-container">
                    <div className="grid-elite grid-elite-4">
                        <div className="metric-elite animate-elite-fade-in">
                            <div className="metric-elite-number" data-metric="users">0</div>
                            <div className="metric-elite-label">Active Users</div>
                        </div>

                        <div className="metric-elite animate-elite-fade-in" style={{ animationDelay: '100ms' }}>
                            <div className="metric-elite-number" data-metric="tasks">0</div>
                            <div className="metric-elite-label">Tasks Completed</div>
                        </div>

                        <div className="metric-elite animate-elite-fade-in" style={{ animationDelay: '200ms' }}>
                            <div className="metric-elite-number" data-metric="uptime">0</div>
                            <div className="metric-elite-label">Uptime</div>
                        </div>

                        <div className="metric-elite animate-elite-fade-in" style={{ animationDelay: '300ms' }}>
                            <div className="metric-elite-number" data-metric="rating">0</div>
                            <div className="metric-elite-label">User Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="section-elite" style={{ background: 'var(--bg-elite-surface)' }}>
                <div className="section-elite-container">
                    <div style={{ textAlign: 'center', marginBottom: '80px' }} className="animate-elite-fade-in">
                        <h2 className="text-elite-h1" style={{ marginBottom: '16px' }}>
                            Loved by productive teams
                        </h2>
                        <p className="text-elite-body" style={{ color: 'var(--text-elite-secondary)', fontSize: '20px', maxWidth: '600px', margin: '0 auto' }}>
                            See what our users have to say about Productiv
                        </p>
                    </div>

                    <div className="grid-elite grid-elite-3">
                        <div className="testimonial-elite animate-elite-slide-up">
                            <div className="testimonial-elite-content">
                                "Productiv replaced three productivity tools for our entire team. Everything just works together seamlessly."
                            </div>
                            <div className="testimonial-elite-author">
                                <div className="testimonial-elite-avatar">JD</div>
                                <div className="testimonial-elite-info">
                                    <div className="testimonial-elite-name">John Doe</div>
                                    <div className="testimonial-elite-title">CEO at TechCorp</div>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-elite animate-elite-slide-up" style={{ animationDelay: '100ms' }}>
                            <div className="testimonial-elite-content">
                                "The keyboard-first workflow changed everything. I can now manage my entire day without touching the mouse."
                            </div>
                            <div className="testimonial-elite-author">
                                <div className="testimonial-elite-avatar">SK</div>
                                <div className="testimonial-elite-info">
                                    <div className="testimonial-elite-name">Sarah Kim</div>
                                    <div className="testimonial-elite-title">Product Designer</div>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-elite animate-elite-slide-up" style={{ animationDelay: '200ms' }}>
                            <div className="testimonial-elite-content">
                                "Finally, a productivity app that understands how real people work. The habit tracking is game-changing."
                            </div>
                            <div className="testimonial-elite-author">
                                <div className="testimonial-elite-avatar">MC</div>
                                <div className="testimonial-elite-info">
                                    <div className="testimonial-elite-name">Mike Chen</div>
                                    <div className="testimonial-elite-title">Software Engineer</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="section-elite section-elite-cta">
                <div className="section-elite-container">
                    <div style={{ textAlign: 'center' }} className="animate-elite-fade-in">
                        <h2 className="text-elite-h1" style={{ marginBottom: '16px' }}>
                            Ready to transform your productivity?
                        </h2>
                        <p className="text-elite-body" style={{
                            color: 'var(--text-elite-secondary)',
                            fontSize: '20px',
                            marginBottom: '40px',
                            maxWidth: '600px',
                            margin: '0 auto 40px'
                        }}>
                            Join thousands of users already using Productiv to stay focused and get more done.
                        </p>
                        <Link to="/signup" className="btn-elite-primary btn-elite-glow" style={{ fontSize: '18px', padding: '20px 40px' }}>
                            Get Started Free
                            <span style={{ fontSize: '20px' }}>→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="section-elite" style={{ background: 'var(--bg-elite-surface)', borderTop: '1px solid var(--border-elite)' }}>
                <div className="section-elite-container">
                    <div className="grid-elite grid-elite-4" style={{ marginBottom: '48px' }}>
                        <div>
                            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-elite-primary)' }}>Product</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <li><a href="#" style={{ color: 'var(--text-elite-secondary)', textDecoration: 'none', fontSize: '14px' }}>Features</a></li>
                                <li><a href="#" style={{ color: 'var(--text-elite-secondary)', textDecoration: 'none', fontSize: '14px' }}>Pricing</a></li>
                                <li><a href="#" style={{ color: 'var(--text-elite-secondary)', textDecoration: 'none', fontSize: '14px' }}>Roadmap</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-elite-primary)' }}>Resources</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <li><a href="#" style={{ color: 'var(--text-elite-secondary)', textDecoration: 'none', fontSize: '14px' }}>Blog</a></li>
                                <li><a href="#" style={{ color: 'var(--text-elite-secondary)', textDecoration: 'none', fontSize: '14px' }}>Help Center</a></li>
                                <li><a href="#" style={{ color: 'var(--text-elite-secondary)', textDecoration: 'none', fontSize: '14px' }}>API Docs</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-elite-primary)' }}>Company</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <li><a href="#" style={{ color: 'var(--text-elite-secondary)', textDecoration: 'none', fontSize: '14px' }}>About</a></li>
                                <li><a href="#" style={{ color: 'var(--text-elite-secondary)', textDecoration: 'none', fontSize: '14px' }}>Careers</a></li>
                                <li><a href="#" style={{ color: 'var(--text-elite-secondary)', textDecoration: 'none', fontSize: '14px' }}>Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-elite-primary)' }}>Legal</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <li><a href="#" style={{ color: 'var(--text-elite-secondary)', textDecoration: 'none', fontSize: '14px' }}>Privacy</a></li>
                                <li><a href="#" style={{ color: 'var(--text-elite-secondary)', textDecoration: 'none', fontSize: '14px' }}>Terms</a></li>
                                <li><a href="#" style={{ color: 'var(--text-elite-secondary)', textDecoration: 'none', fontSize: '14px' }}>Security</a></li>
                            </ul>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '32px',
                        borderTop: '1px solid var(--border-elite)'
                    }}>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-elite-primary)' }}>
                            Productiv
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-elite-muted)' }}>
                            © 2024 Productiv. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
