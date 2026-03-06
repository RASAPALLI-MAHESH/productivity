import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export function Landing() {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        const elements = document.querySelectorAll('.scroll-animate');
        elements.forEach(el => observerRef.current?.observe(el));

        // Animate chart bars
        const chartBars = document.querySelectorAll('.chart-bar');
        const chartObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target as HTMLElement;
                    const height = bar.style.height;
                    bar.style.height = '0';
                    setTimeout(() => {
                        bar.style.transition = 'height 1s ease-out';
                        bar.style.height = height;
                    }, 100);
                    chartObserver.unobserve(bar);
                }
            });
        }, { threshold: 0.5 });

        chartBars.forEach(bar => {
            chartObserver.observe(bar);
        });

        // Animate stat numbers
        const statNumbers = document.querySelectorAll('.stat-number');
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target as HTMLElement;
                    const text = element.textContent;
                    
                    if (text?.includes('%')) {
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

        return () => observerRef.current?.disconnect();
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

    const handleTaskClick = (e: React.MouseEvent) => {
        const checkbox = e.currentTarget as HTMLElement;
        const taskItem = checkbox.closest('.task-item');
        if (checkbox.classList.contains('checked')) {
            checkbox.classList.remove('checked');
            taskItem?.classList.remove('completed');
        } else {
            checkbox.classList.add('checked');
            taskItem?.classList.add('completed');
        }
    };

    return (
        <div className="landing-container">
            {/* Navigation */}
            <nav className="landing-navbar">
                <div className="landing-nav-container">
                    <div className="landing-nav-left">
                        <div className="landing-logo">Productiv</div>
                    </div>
                    <div className={`landing-nav-center ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                        <a href="#features" className="landing-nav-link">Features</a>
                        <a href="#habits" className="landing-nav-link">Habits</a>
                        <a href="#deadlines" className="landing-nav-link">Deadlines</a>
                        <a href="#pricing" className="landing-nav-link">Pricing</a>
                    </div>
                    <div className={`landing-nav-right ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                        <Link to="/login" className="landing-btn-secondary">Login</Link>
                        <Link to="/signup" className="landing-btn-primary">Get Started</Link>
                    </div>
                    <div className="landing-mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero-container">
                    <div className="landing-hero-content">
                        <div className="landing-hero-left scroll-animate">
                            <h1 className="landing-hero-title">Finally, a productivity system that actually works.</h1>
                            <p className="landing-hero-subtitle">Manage tasks, build habits, and track deadlines in one powerful productivity command center.</p>
                            <div className="landing-hero-buttons">
                                <Link to="/signup" className="landing-btn-primary landing-btn-large">Start for free</Link>
                                <Link to="/login" className="landing-btn-secondary landing-btn-large">View demo</Link>
                            </div>
                        </div>
                        <div className="landing-hero-right scroll-animate">
                            <div className="landing-product-preview">
                                <div className="landing-preview-header">
                                    <div className="landing-preview-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <div className="landing-preview-title">Productiv Dashboard</div>
                                </div>
                                <div className="landing-preview-content">
                                    <div className="landing-task-list">
                                        <div className="landing-task-item">
                                            <div className="landing-task-checkbox" onClick={handleTaskClick}></div>
                                            <span className="landing-task-text">Complete project proposal</span>
                                        </div>
                                        <div className="landing-task-item completed">
                                            <div className="landing-task-checkbox checked" onClick={handleTaskClick}></div>
                                            <span className="landing-task-text">Review design mockups</span>
                                        </div>
                                        <div className="landing-task-item">
                                            <div className="landing-task-checkbox" onClick={handleTaskClick}></div>
                                            <span className="landing-task-text">Team standup meeting</span>
                                        </div>
                                    </div>
                                    <div className="landing-habit-streak">
                                        <div className="landing-streak-header">🔥 7 day streak</div>
                                        <div className="landing-streak-days">
                                            <div className="landing-day completed">M</div>
                                            <div className="landing-day completed">T</div>
                                            <div className="landing-day completed">W</div>
                                            <div className="landing-day completed">T</div>
                                            <div className="landing-day completed">F</div>
                                            <div className="landing-day completed">S</div>
                                            <div className="landing-day completed">S</div>
                                        </div>
                                    </div>
                                    <div className="landing-deadline-card">
                                        <div className="landing-deadline-title">Upcoming Deadline</div>
                                        <div className="landing-deadline-task">Q4 Report</div>
                                        <div className="landing-deadline-time">2 days remaining</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Preview Section */}
            <section className="landing-product-preview-section">
                <div className="landing-container">
                    <div className="landing-section-header scroll-animate">
                        <h2>Everything you need to stay productive</h2>
                        <p>Powerful features designed to help you achieve more</p>
                    </div>
                    <div className="landing-preview-cards">
                        <div className="landing-preview-card scroll-animate">
                            <div className="landing-card-image">
                                <div className="landing-mini-ui landing-tasks-ui">
                                    <div className="landing-ui-header">Tasks</div>
                                    <div className="landing-ui-items">
                                        <div className="landing-ui-item">✓ Design review</div>
                                        <div className="landing-ui-item">Code review</div>
                                        <div className="landing-ui-item">Documentation</div>
                                    </div>
                                </div>
                            </div>
                            <h3>Task Management</h3>
                            <p>Organize and prioritize your work with intelligent task management that adapts to your workflow.</p>
                        </div>
                        <div className="landing-preview-card scroll-animate">
                            <div className="landing-card-image">
                                <div className="landing-mini-ui landing-habits-ui">
                                    <div className="landing-ui-header">Habits</div>
                                    <div className="landing-habit-calendar">
                                        <div className="landing-habit-day filled"></div>
                                        <div className="landing-habit-day filled"></div>
                                        <div className="landing-habit-day filled"></div>
                                        <div className="landing-habit-day"></div>
                                        <div className="landing-habit-day filled"></div>
                                    </div>
                                </div>
                            </div>
                            <h3>Habit Tracking</h3>
                            <p>Build consistent routines with visual streak tracking and smart reminders that keep you motivated.</p>
                        </div>
                        <div className="landing-preview-card scroll-animate">
                            <div className="landing-card-image">
                                <div className="landing-mini-ui landing-deadlines-ui">
                                    <div className="landing-ui-header">Deadlines</div>
                                    <div className="landing-deadline-item">
                                        <div className="landing-deadline-bar"></div>
                                        <span>Project Launch</span>
                                    </div>
                                </div>
                            </div>
                            <h3>Deadline Intelligence</h3>
                            <p>Never miss important dates with smart deadline tracking and automated reminders.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-features-section" id="features">
                <div className="landing-container">
                    <div className="landing-section-header scroll-animate">
                        <h2>Designed for power users</h2>
                        <p>Features that make productivity effortless</p>
                    </div>
                    <div className="landing-features-grid">
                        <div className="landing-feature-card scroll-animate">
                            <div className="landing-feature-icon">⚡</div>
                            <h3>Lightning fast task management</h3>
                            <p>Add, organize, and complete tasks in seconds with our streamlined interface.</p>
                        </div>
                        <div className="landing-feature-card scroll-animate">
                            <div className="landing-feature-icon">🔥</div>
                            <h3>Habit streak tracking</h3>
                            <p>Build momentum with visual streaks and achievement celebrations.</p>
                        </div>
                        <div className="landing-feature-card scroll-animate">
                            <div className="landing-feature-icon">🔔</div>
                            <h3>Smart deadline reminders</h3>
                            <p>Intelligent notifications that help you stay ahead of your commitments.</p>
                        </div>
                        <div className="landing-feature-card scroll-animate">
                            <div className="landing-feature-icon">⌨️</div>
                            <h3>Keyboard-first workflow</h3>
                            <p>Navigate and control everything with powerful keyboard shortcuts.</p>
                        </div>
                        <div className="landing-feature-card scroll-animate">
                            <div className="landing-feature-icon">🎯</div>
                            <h3>Clean distraction-free interface</h3>
                            <p>Focus on what matters with a minimal design that eliminates clutter.</p>
                        </div>
                        <div className="landing-feature-card scroll-animate">
                            <div className="landing-feature-icon">📊</div>
                            <h3>Powerful productivity insights</h3>
                            <p>Understand your patterns with detailed analytics and progress tracking.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How Productiv Works */}
            <section className="landing-how-it-works">
                <div className="landing-container">
                    <div className="landing-section-header scroll-animate">
                        <h2>How Productiv Works</h2>
                        <p>Get started in three simple steps</p>
                    </div>
                    <div className="landing-steps">
                        <div className="landing-step scroll-animate">
                            <div className="landing-step-number">1</div>
                            <h3>Capture tasks instantly</h3>
                            <p>Quickly add tasks from anywhere with our fast capture system.</p>
                        </div>
                        <div className="landing-step-connector"></div>
                        <div className="landing-step scroll-animate">
                            <div className="landing-step-number">2</div>
                            <h3>Build consistent habits</h3>
                            <p>Develop routines that stick with visual progress tracking.</p>
                        </div>
                        <div className="landing-step-connector"></div>
                        <div className="landing-step scroll-animate">
                            <div className="landing-step-number">3</div>
                            <h3>Achieve focused productivity</h3>
                            <p>Stay on track and accomplish more with intelligent insights.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Productivity Visualization */}
            <section className="landing-visualization-section">
                <div className="landing-container">
                    <div className="landing-section-header scroll-animate">
                        <h2>See your productivity soar</h2>
                        <p>Beautiful insights that motivate you to do more</p>
                    </div>
                    <div className="landing-dashboard-preview scroll-animate">
                        <div className="landing-dashboard-header">
                            <div className="landing-dashboard-title">Productivity Dashboard</div>
                            <div className="landing-dashboard-period">Last 30 days</div>
                        </div>
                        <div className="landing-dashboard-content">
                            <div className="landing-dashboard-stats">
                                <div className="landing-stat-card">
                                    <div className="landing-stat-number">142</div>
                                    <div className="landing-stat-label">Tasks Completed</div>
                                </div>
                                <div className="landing-stat-card">
                                    <div className="landing-stat-number">21</div>
                                    <div className="landing-stat-label">Day Streak</div>
                                </div>
                                <div className="landing-stat-card">
                                    <div className="landing-stat-number">89%</div>
                                    <div className="landing-stat-label">On-Time Rate</div>
                                </div>
                            </div>
                            <div className="landing-chart-container">
                                <div className="landing-chart-bars">
                                    <div className="landing-chart-bar" style={{height: '60%'}}></div>
                                    <div className="landing-chart-bar" style={{height: '80%'}}></div>
                                    <div className="landing-chart-bar" style={{height: '45%'}}></div>
                                    <div className="landing-chart-bar" style={{height: '90%'}}></div>
                                    <div className="landing-chart-bar" style={{height: '70%'}}></div>
                                    <div className="landing-chart-bar" style={{height: '85%'}}></div>
                                    <div className="landing-chart-bar" style={{height: '95%'}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="landing-social-proof">
                <div className="landing-container">
                    <div className="landing-social-proof-header scroll-animate">
                        <h2>Trusted by developers, students, and creators worldwide.</h2>
                    </div>
                    <div className="landing-testimonials">
                        <div className="landing-testimonial scroll-animate">
                            <div className="landing-testimonial-content">"Productiv transformed how I manage my daily tasks. The interface is clean and the features are exactly what I needed."</div>
                            <div className="landing-testimonial-author">
                                <div className="landing-author-name">Sarah Chen</div>
                                <div className="landing-author-title">Software Developer</div>
                            </div>
                        </div>
                        <div className="landing-testimonial scroll-animate">
                            <div className="landing-testimonial-content">"The habit tracking feature helped me build routines I've been struggling with for years. Highly recommended!"</div>
                            <div className="landing-testimonial-author">
                                <div className="landing-author-name">Michael Rodriguez</div>
                                <div className="landing-author-title">Graduate Student</div>
                            </div>
                        </div>
                        <div className="landing-testimonial scroll-animate">
                            <div className="landing-testimonial-content">"Finally, a productivity tool that doesn't get in my way. It's fast, intuitive, and powerful."</div>
                            <div className="landing-testimonial-author">
                                <div className="landing-author-name">Emma Thompson</div>
                                <div className="landing-author-title">Content Creator</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="landing-final-cta">
                <div className="landing-container">
                    <div className="landing-cta-content scroll-animate">
                        <h2>Take control of your productivity today.</h2>
                        <p>Join thousands of users who have already transformed their workflow.</p>
                        <Link to="/signup" className="landing-btn-primary landing-btn-large">Get Started Free</Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-container">
                    <div className="landing-footer-content">
                        <div className="landing-footer-section">
                            <h4>Product</h4>
                            <ul>
                                <li><a href="#">Features</a></li>
                                <li><a href="#">Pricing</a></li>
                                <li><a href="#">Integrations</a></li>
                            </ul>
                        </div>
                        <div className="landing-footer-section">
                            <h4>Resources</h4>
                            <ul>
                                <li><a href="#">Docs</a></li>
                                <li><a href="#">Blog</a></li>
                                <li><a href="#">Tutorials</a></li>
                            </ul>
                        </div>
                        <div className="landing-footer-section">
                            <h4>Company</h4>
                            <ul>
                                <li><a href="#">About</a></li>
                                <li><a href="#">Contact</a></li>
                                <li><a href="#">Careers</a></li>
                            </ul>
                        </div>
                        <div className="landing-footer-section">
                            <h4>Legal</h4>
                            <ul>
                                <li><a href="#">Privacy</a></li>
                                <li><a href="#">Terms</a></li>
                                <li><a href="#">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="landing-footer-bottom">
                        <div className="landing-footer-logo">Productiv</div>
                        <div className="landing-footer-copyright">© 2024 Productiv. All rights reserved.</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
