import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export function LandingPremium() {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set([1]));
    const [completedDays, setCompletedDays] = useState<Set<number>>(new Set([0, 1, 2, 3, 4, 5, 6]));

    useEffect(() => {
        // Handle scroll for navbar
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Intersection Observer for animations
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        const elements = document.querySelectorAll('.scroll-animate');
        elements.forEach(el => observerRef.current?.observe(el));

        // Animate stat numbers
        const statNumbers = document.querySelectorAll('.landing-stat-number-premium');
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target as HTMLElement;
                    const text = element.textContent;

                    if (text?.includes('+')) {
                        const number = parseInt(text.replace(/\D/g, ''));
                        animateCounter(element, number, 2000, '+');
                    } else if (text?.includes('%')) {
                        const number = parseInt(text);
                        animateCounter(element, number, 2000, '%');
                    } else {
                        const number = parseInt(text || '0');
                        animateCounter(element, number, 2000);
                    }

                    statsObserver.unobserve(element);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(stat => {
            statsObserver.observe(stat);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observerRef.current?.disconnect();
        };
    }, []);

    const animateCounter = (element: HTMLElement, target: number, duration: number = 2000, suffix?: string) => {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + (suffix || '');
        }, 16);
    };

    const handleTaskClick = (taskId: number) => {
        setCompletedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const handleDayClick = (dayIndex: number) => {
        setCompletedDays(prev => {
            const newSet = new Set(prev);
            if (newSet.has(dayIndex)) {
                newSet.delete(dayIndex);
            } else {
                newSet.add(dayIndex);
            }
            return newSet;
        });
    };

    return (
        <div className="landing-premium">
            {/* Premium Navigation */}
            <nav className={`landing-nav-premium ${scrolled ? 'scrolled' : ''}`}>
                <div className="landing-nav-container-premium">
                    <Link to="/" className="landing-logo-premium">
                        <div className="landing-logo-icon-premium">P</div>
                        <span>Productiv</span>
                    </Link>

                    <div className="landing-nav-center-premium">
                        <a href="#features" className="landing-nav-link-premium">Features</a>
                        <a href="#habits" className="landing-nav-link-premium">Habits</a>
                        <a href="#deadlines" className="landing-nav-link-premium">Deadlines</a>
                        <a href="#pricing" className="landing-nav-link-premium">Pricing</a>
                    </div>

                    <div className="landing-nav-actions-premium">
                        <Link to="/login" className="landing-btn-premium-secondary">Login</Link>
                        <Link to="/signup" className="landing-btn-premium-primary">
                            Get Started
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="landing-hero-premium">
                <div className="landing-hero-container-premium">
                    <div className="landing-hero-left-premium">
                        <div className="landing-hero-badge-premium scroll-animate">
                            ✨ The future of productivity is here
                        </div>

                        <h1 className="landing-hero-title-premium scroll-animate">
                            Finally, a productivity system that actually works.
                        </h1>

                        <p className="landing-hero-subtitle-premium scroll-animate">
                            Manage tasks, build habits, and track deadlines in one powerful productivity command center designed for peak performance.
                        </p>

                        <div className="landing-hero-actions-premium scroll-animate">
                            <Link to="/signup" className="landing-btn-premium-primary">
                                Start for free
                                <span>→</span>
                            </Link>
                            <Link to="/login" className="landing-btn-premium-secondary">
                                View demo
                            </Link>
                        </div>
                    </div>

                    <div className="landing-hero-right-premium">
                        <div className="landing-product-preview-premium">
                            <div className="landing-product-mockup-premium">
                                <div className="landing-mockup-header-premium">
                                    <div className="landing-mockup-dots-premium">
                                        <div className="landing-mockup-dot-premium"></div>
                                        <div className="landing-mockup-dot-premium"></div>
                                        <div className="landing-mockup-dot-premium"></div>
                                    </div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                        Productiv Dashboard
                                    </span>
                                </div>

                                <div className="landing-mockup-content-premium">
                                    <div className="landing-task-list-premium">
                                        <div
                                            className={`landing-task-item-premium ${completedTasks.has(0) ? 'completed' : ''}`}
                                            onClick={() => handleTaskClick(0)}
                                        >
                                            <div className={`landing-task-checkbox-premium ${completedTasks.has(0) ? 'checked' : ''}`}></div>
                                            <span className="landing-task-text-premium">Complete project proposal</span>
                                        </div>
                                        <div
                                            className={`landing-task-item-premium ${completedTasks.has(1) ? 'completed' : ''}`}
                                            onClick={() => handleTaskClick(1)}
                                        >
                                            <div className={`landing-task-checkbox-premium ${completedTasks.has(1) ? 'checked' : ''}`}></div>
                                            <span className="landing-task-text-premium">Review design mockups</span>
                                        </div>
                                        <div
                                            className={`landing-task-item-premium ${completedTasks.has(2) ? 'completed' : ''}`}
                                            onClick={() => handleTaskClick(2)}
                                        >
                                            <div className={`landing-task-checkbox-premium ${completedTasks.has(2) ? 'checked' : ''}`}></div>
                                            <span className="landing-task-text-premium">Team standup meeting</span>
                                        </div>
                                    </div>

                                    <div className="landing-habit-streak-premium">
                                        <div className="landing-streak-header-premium">
                                            <span className="landing-streak-fire-premium">🔥</span>
                                            <span>{completedDays.size} day streak</span>
                                        </div>
                                        <div className="landing-streak-days-premium">
                                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                                                <div
                                                    key={index}
                                                    className={`landing-streak-day-premium ${completedDays.has(index) ? 'completed' : ''}`}
                                                    onClick={() => handleDayClick(index)}
                                                >
                                                    {day}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-features-premium" id="features">
                <div className="landing-features-container-premium">
                    <div className="landing-features-header-premium">
                        <h2 className="landing-features-title-premium scroll-animate">
                            Designed for excellence
                        </h2>
                        <p className="landing-features-subtitle-premium scroll-animate">
                            Powerful features that help you achieve your best work
                        </p>
                    </div>

                    <div className="landing-features-grid-premium">
                        <div className="landing-feature-card-premium scroll-animate">
                            <div className="landing-feature-icon-premium">⚡</div>
                            <h3 className="landing-feature-title-premium">Lightning Fast</h3>
                            <p className="landing-feature-description-premium">
                                Sub-100ms interactions with keyboard-first design. Built for speed and precision.
                            </p>
                        </div>

                        <div className="landing-feature-card-premium scroll-animate">
                            <div className="landing-feature-icon-premium">🔥</div>
                            <h3 className="landing-feature-title-premium">Smart Habits</h3>
                            <p className="landing-feature-description-premium">
                                Build consistent routines with visual streak tracking and intelligent reminders.
                            </p>
                        </div>

                        <div className="landing-feature-card-premium scroll-animate">
                            <div className="landing-feature-icon-premium">🎯</div>
                            <h3 className="landing-feature-title-premium">Deadline Intelligence</h3>
                            <p className="landing-feature-description-premium">
                                Never miss important dates with smart deadline tracking and automated insights.
                            </p>
                        </div>

                        <div className="landing-feature-card-premium scroll-animate">
                            <div className="landing-feature-icon-premium">⌨️</div>
                            <h3 className="landing-feature-title-premium">Keyboard First</h3>
                            <p className="landing-feature-description-premium">
                                Navigate everything with powerful keyboard shortcuts. Never touch your mouse.
                            </p>
                        </div>

                        <div className="landing-feature-card-premium scroll-animate">
                            <div className="landing-feature-icon-premium">📊</div>
                            <h3 className="landing-feature-title-premium">Deep Analytics</h3>
                            <p className="landing-feature-description-premium">
                                Understand your patterns with detailed productivity insights and progress tracking.
                            </p>
                        </div>

                        <div className="landing-feature-card-premium scroll-animate">
                            <div className="landing-feature-icon-premium">🎨</div>
                            <h3 className="landing-feature-title-premium">Beautiful Design</h3>
                            <p className="landing-feature-description-premium">
                                A distraction-free interface that helps you focus on what matters most.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="landing-stats-premium">
                <div className="landing-stats-container-premium">
                    <div className="landing-stat-card-premium scroll-animate">
                        <div className="landing-stat-number-premium">50K+</div>
                        <div className="landing-stat-label-premium">Active Users</div>
                    </div>

                    <div className="landing-stat-card-premium scroll-animate">
                        <div className="landing-stat-number-premium">1M+</div>
                        <div className="landing-stat-label-premium">Tasks Completed</div>
                    </div>

                    <div className="landing-stat-card-premium scroll-animate">
                        <div className="landing-stat-number-premium">99.9%</div>
                        <div className="landing-stat-label-premium">Uptime</div>
                    </div>

                    <div className="landing-stat-card-premium scroll-animate">
                        <div className="landing-stat-number-premium">4.9★</div>
                        <div className="landing-stat-label-premium">User Rating</div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="landing-cta-premium">
                <div className="landing-cta-container-premium">
                    <h2 className="landing-cta-title-premium scroll-animate">
                        Ready to transform your productivity?
                    </h2>
                    <p className="landing-cta-subtitle-premium scroll-animate">
                        Join thousands of users who have already unlocked their potential with Productiv.
                    </p>
                    <div className="scroll-animate">
                        <Link to="/signup" className="landing-btn-premium-primary">
                            Get Started Free
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
