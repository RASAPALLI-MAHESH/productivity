import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../store/themeStore';

export function Landing() {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [activeFeature, setActiveFeature] = useState(0);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const { theme, toggleTheme } = useThemeStore();
    const heroRef = useRef<HTMLDivElement>(null);
    const dropdownTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

        const elements = document.querySelectorAll('.reveal-on-scroll');
        elements.forEach(el => observerRef.current?.observe(el));

        return () => observerRef.current?.disconnect();
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Parallax mouse tracking for hero
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
                const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
                setMousePos({ x, y });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Auto-rotate features
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature(prev => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Handle dropdown hover
    const handleDropdownEnter = (name: string) => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
        }
        setActiveDropdown(name);
    };

    const handleDropdownLeave = () => {
        dropdownTimeoutRef.current = window.setTimeout(() => {
            setActiveDropdown(null);
        }, 150);
    };

    const features = [
        { icon: 'rocket_launch', title: 'Velocity Mode', desc: 'Keyboard-first. Sub-50ms response. Built for flow state.' },
        { icon: 'psychology', title: 'Adaptive Intelligence', desc: 'Learns your patterns. Surfaces what matters, when it matters.' },
        { icon: 'timeline', title: 'Temporal Awareness', desc: 'See your week unfold. Never miss what\'s coming.' },
    ];

    return (
        <div className="landing">
            {/* ═══ FLOATING ORBS ═══ */}
            <div className="landing-orbs" aria-hidden="true">
                <div className="landing-orb landing-orb-1"></div>
                <div className="landing-orb landing-orb-2"></div>
                <div className="landing-orb landing-orb-3"></div>
            </div>

            {/* ═══ HEADER ═══ */}
            <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
                <div className="landing-header-inner">
                    <Link to="/" className="landing-logo">
                        <div className="landing-logo-mark">
                            <div className="landing-logo-pulse"></div>
                            <svg viewBox="0 0 32 32" fill="none">
                                <rect width="32" height="32" rx="10" fill="url(#logoGrad)" />
                                <path d="M9 16L13.5 20.5L23 11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <defs>
                                    <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
                                        <stop stopColor="#8B5CF6" />
                                        <stop offset="1" stopColor="#6366F1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <span className="landing-logo-text">Productiv</span>
                    </Link>

                    <nav className="landing-nav">
                        {/* Features Dropdown */}
                        <div 
                            className={`landing-nav-item ${activeDropdown === 'features' ? 'active' : ''}`}
                            onMouseEnter={() => handleDropdownEnter('features')}
                            onMouseLeave={handleDropdownLeave}
                        >
                            <button className="landing-nav-trigger">
                                <span>Features</span>
                                <span className="material-symbols-outlined landing-nav-arrow">expand_more</span>
                            </button>
                            <div className="landing-dropdown landing-dropdown-features">
                                <div className="landing-dropdown-section">
                                    <span className="landing-dropdown-label">Core Features</span>
                                    <a href="#features" className="landing-dropdown-item">
                                        <span className="landing-dropdown-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                                            <span className="material-symbols-outlined">task_alt</span>
                                        </span>
                                        <div className="landing-dropdown-content">
                                            <span className="landing-dropdown-title">Task Management</span>
                                            <span className="landing-dropdown-desc">Capture, organize, and complete tasks effortlessly</span>
                                        </div>
                                    </a>
                                    <a href="#features" className="landing-dropdown-item">
                                        <span className="landing-dropdown-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                                            <span className="material-symbols-outlined">local_fire_department</span>
                                        </span>
                                        <div className="landing-dropdown-content">
                                            <span className="landing-dropdown-title">Habit Tracking</span>
                                            <span className="landing-dropdown-desc">Build consistency with powerful streak tracking</span>
                                        </div>
                                    </a>
                                    <a href="#features" className="landing-dropdown-item">
                                        <span className="landing-dropdown-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                            <span className="material-symbols-outlined">event_available</span>
                                        </span>
                                        <div className="landing-dropdown-content">
                                            <span className="landing-dropdown-title">Deadline Tracking</span>
                                            <span className="landing-dropdown-desc">Never miss important dates and milestones</span>
                                        </div>
                                    </a>
                                </div>
                                <div className="landing-dropdown-section">
                                    <span className="landing-dropdown-label">Advanced</span>
                                    <a href="#features" className="landing-dropdown-item">
                                        <span className="landing-dropdown-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                                            <span className="material-symbols-outlined">psychology</span>
                                        </span>
                                        <div className="landing-dropdown-content">
                                            <span className="landing-dropdown-title">Smart Insights</span>
                                            <span className="landing-dropdown-desc">AI-powered productivity suggestions</span>
                                        </div>
                                    </a>
                                    <a href="#features" className="landing-dropdown-item">
                                        <span className="landing-dropdown-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)' }}>
                                            <span className="material-symbols-outlined">timeline</span>
                                        </span>
                                        <div className="landing-dropdown-content">
                                            <span className="landing-dropdown-title">Timeline View</span>
                                            <span className="landing-dropdown-desc">Visualize your week at a glance</span>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Made For Dropdown */}
                        <div 
                            className={`landing-nav-item ${activeDropdown === 'madefor' ? 'active' : ''}`}
                            onMouseEnter={() => handleDropdownEnter('madefor')}
                            onMouseLeave={handleDropdownLeave}
                        >
                            <button className="landing-nav-trigger">
                                <span>Made For</span>
                                <span className="material-symbols-outlined landing-nav-arrow">expand_more</span>
                            </button>
                            <div className="landing-dropdown landing-dropdown-compact">
                                <a href="#showcase" className="landing-dropdown-item">
                                    <span className="landing-dropdown-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                                        <span className="material-symbols-outlined">person</span>
                                    </span>
                                    <div className="landing-dropdown-content">
                                        <span className="landing-dropdown-title">Individuals</span>
                                        <span className="landing-dropdown-desc">Personal productivity toolkit</span>
                                    </div>
                                </a>
                                <a href="#showcase" className="landing-dropdown-item">
                                    <span className="landing-dropdown-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                                        <span className="material-symbols-outlined">code</span>
                                    </span>
                                    <div className="landing-dropdown-content">
                                        <span className="landing-dropdown-title">Developers</span>
                                        <span className="landing-dropdown-desc">Built for keyboard-first workflows</span>
                                    </div>
                                </a>
                                <a href="#showcase" className="landing-dropdown-item">
                                    <span className="landing-dropdown-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                        <span className="material-symbols-outlined">school</span>
                                    </span>
                                    <div className="landing-dropdown-content">
                                        <span className="landing-dropdown-title">Students</span>
                                        <span className="landing-dropdown-desc">Ace your assignments and exams</span>
                                    </div>
                                </a>
                                <a href="#showcase" className="landing-dropdown-item">
                                    <span className="landing-dropdown-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                                        <span className="material-symbols-outlined">groups</span>
                                    </span>
                                    <div className="landing-dropdown-content">
                                        <span className="landing-dropdown-title">Teams</span>
                                        <span className="landing-dropdown-desc">Collaborate and stay aligned</span>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Resources Dropdown */}
                        <div 
                            className={`landing-nav-item ${activeDropdown === 'resources' ? 'active' : ''}`}
                            onMouseEnter={() => handleDropdownEnter('resources')}
                            onMouseLeave={handleDropdownLeave}
                        >
                            <button className="landing-nav-trigger">
                                <span>Resources</span>
                                <span className="material-symbols-outlined landing-nav-arrow">expand_more</span>
                            </button>
                            <div className="landing-dropdown landing-dropdown-compact">
                                <a href="#philosophy" className="landing-dropdown-item">
                                    <span className="landing-dropdown-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                                        <span className="material-symbols-outlined">menu_book</span>
                                    </span>
                                    <div className="landing-dropdown-content">
                                        <span className="landing-dropdown-title">Getting Started</span>
                                        <span className="landing-dropdown-desc">Learn the basics in 5 minutes</span>
                                    </div>
                                </a>
                                <a href="#philosophy" className="landing-dropdown-item">
                                    <span className="landing-dropdown-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                                        <span className="material-symbols-outlined">article</span>
                                    </span>
                                    <div className="landing-dropdown-content">
                                        <span className="landing-dropdown-title">Blog</span>
                                        <span className="landing-dropdown-desc">Productivity tips and insights</span>
                                    </div>
                                </a>
                                <a href="#philosophy" className="landing-dropdown-item">
                                    <span className="landing-dropdown-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                        <span className="material-symbols-outlined">help</span>
                                    </span>
                                    <div className="landing-dropdown-content">
                                        <span className="landing-dropdown-title">Help Center</span>
                                        <span className="landing-dropdown-desc">FAQs and support documentation</span>
                                    </div>
                                </a>
                                <a href="#philosophy" className="landing-dropdown-item">
                                    <span className="landing-dropdown-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                                        <span className="material-symbols-outlined">update</span>
                                    </span>
                                    <div className="landing-dropdown-content">
                                        <span className="landing-dropdown-title">Changelog</span>
                                        <span className="landing-dropdown-desc">Latest updates and features</span>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Pricing Link */}
                        <a href="#" className="landing-nav-link">
                            <span className="landing-nav-link-text">Pricing</span>
                            <span className="landing-nav-link-indicator"></span>
                        </a>
                    </nav>

                    <div className="landing-header-actions">
                        <button
                            className="landing-theme-toggle"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            <span className="landing-theme-toggle-track">
                                <span className="landing-theme-toggle-thumb">
                                    <span className="material-symbols-outlined">
                                        {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                                    </span>
                                </span>
                            </span>
                        </button>
                        <Link to="/login" className="landing-btn-ghost">
                            <span>Log in</span>
                        </Link>
                        <Link to="/signup" className="landing-btn-primary">
                            <span className="landing-btn-text">Start for free</span>
                            <span className="landing-btn-shine"></span>
                        </Link>
                    </div>

                    <button className="landing-mobile-menu" aria-label="Menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </header>

            {/* ═══ HERO ═══ */}
            <section className="landing-hero" ref={heroRef}>
                <div className="landing-hero-grid" aria-hidden="true"></div>
                
                <div className="landing-hero-content reveal-on-scroll">
                    <div className="landing-hero-eyebrow">
                        <span className="landing-hero-eyebrow-icon">
                            <span className="material-symbols-outlined">bolt</span>
                        </span>
                        <span className="landing-typing-text">The productivity system you'll actually use</span>
                    </div>

                    <h1 className="landing-hero-title">
                        <span className="landing-hero-title-line">
                            <span className="landing-word-reveal">Your</span>
                            <span className="landing-word-reveal delay-1">mind,</span>
                        </span>
                        <span className="landing-hero-title-line">
                            <span className="landing-word-reveal delay-2">beautifully</span>
                        </span>
                        <span className="landing-hero-title-line">
                            <span className="landing-hero-title-accent landing-word-reveal delay-3">organized.</span>
                        </span>
                    </h1>

                    <p className="landing-hero-desc reveal-on-scroll delay-4">
                        Where tasks become achievements, habits become superpowers, and deadlines become milestones. 
                        <span className="landing-hero-desc-highlight">Built for those who ship.</span>
                    </p>

                    <div className="landing-hero-actions reveal-on-scroll delay-5">
                        <Link to="/signup" className="landing-cta-primary">
                            <span className="landing-cta-bg"></span>
                            <span className="landing-cta-content">
                                <span>Start your journey</span>
                                <span className="material-symbols-outlined">east</span>
                            </span>
                        </Link>
                        <a href="#showcase" className="landing-cta-secondary">
                            <span className="landing-play-icon">
                                <span className="material-symbols-outlined">play_arrow</span>
                            </span>
                            <span>See it in action</span>
                        </a>
                    </div>

                    <div className="landing-hero-trust reveal-on-scroll delay-6">
                        <div className="landing-avatars">
                            <div className="landing-avatar" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>J</div>
                            <div className="landing-avatar" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>S</div>
                            <div className="landing-avatar" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>M</div>
                            <div className="landing-avatar" style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }}>A</div>
                            <div className="landing-avatar landing-avatar-more">+2K</div>
                        </div>
                        <span className="landing-trust-text">
                            Join <strong>2,847</strong> people who leveled up this week
                        </span>
                    </div>
                </div>

                <div 
                    className="landing-hero-visual reveal-on-scroll delay-2"
                    style={{
                        transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`
                    }}
                >
                    <div className="landing-app-window">
                        <div className="landing-app-titlebar">
                            <div className="landing-app-dots">
                                <span></span><span></span><span></span>
                            </div>
                            <div className="landing-app-title">Productiv</div>
                            <div className="landing-app-tabs">
                                <span className="active">Tasks</span>
                                <span>Habits</span>
                                <span>Calendar</span>
                            </div>
                        </div>
                        <div className="landing-app-body">
                            <div className="landing-app-main landing-app-main--full">
                                <div className="landing-app-header">
                                    <h3 className="landing-app-section-title">Today</h3>
                                    <span className="landing-app-count">4 tasks</span>
                                </div>
                                <div className="landing-task landing-task-entering" style={{ animationDelay: '0.2s' }}>
                                    <div className="landing-task-check done">
                                        <span className="material-symbols-outlined">check</span>
                                    </div>
                                    <div className="landing-task-content">
                                        <span className="landing-task-title done">Review product roadmap</span>
                                        <span className="landing-task-meta">
                                            <span className="material-symbols-outlined">flag</span>
                                            High priority
                                        </span>
                                    </div>
                                </div>
                                <div className="landing-task landing-task-entering" style={{ animationDelay: '0.4s' }}>
                                    <div className="landing-task-check done">
                                        <span className="material-symbols-outlined">check</span>
                                    </div>
                                    <div className="landing-task-content">
                                        <span className="landing-task-title done">Ship v2.0 beta</span>
                                        <span className="landing-task-meta">
                                            <span className="material-symbols-outlined">schedule</span>
                                            Completed 2h ago
                                        </span>
                                    </div>
                                </div>
                                <div className="landing-task landing-task-active landing-task-entering" style={{ animationDelay: '0.6s' }}>
                                    <div className="landing-task-check">
                                        <div className="landing-task-check-ring"></div>
                                    </div>
                                    <div className="landing-task-content">
                                        <span className="landing-task-title">Prepare investor pitch deck</span>
                                        <span className="landing-task-meta">
                                            <span className="material-symbols-outlined">calendar_today</span>
                                            Due tomorrow
                                        </span>
                                    </div>
                                    <div className="landing-task-actions">
                                        <span className="material-symbols-outlined">schedule</span>
                                    </div>
                                </div>
                                <div className="landing-task landing-task-entering" style={{ animationDelay: '0.8s' }}>
                                    <div className="landing-task-check"></div>
                                    <div className="landing-task-content">
                                        <span className="landing-task-title">Call with design team</span>
                                        <span className="landing-task-meta">
                                            <span className="material-symbols-outlined">group</span>
                                            3 participants
                                        </span>
                                    </div>
                                </div>
                                <div className="landing-app-add">
                                    <span className="material-symbols-outlined">add</span>
                                    <span>Add task</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating elements */}
                    <div className="landing-float-card landing-float-1" style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}>
                        <div className="landing-float-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                            <span className="material-symbols-outlined">local_fire_department</span>
                        </div>
                        <div className="landing-float-content">
                            <span className="landing-float-label">Current Streak</span>
                            <span className="landing-float-value">14 days</span>
                        </div>
                    </div>

                    <div className="landing-float-card landing-float-2" style={{ transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 25}px)` }}>
                        <div className="landing-float-progress">
                            <svg viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeDasharray="75, 100"
                                    className="landing-progress-ring"
                                />
                            </svg>
                            <span>75%</span>
                        </div>
                        <div className="landing-float-content">
                            <span className="landing-float-label">Daily Progress</span>
                            <span className="landing-float-value">6/8 tasks</span>
                        </div>
                    </div>

                    <div className="landing-float-notification" style={{ transform: `translate(${mousePos.x * 35}px, ${mousePos.y * 35}px)` }}>
                        <span className="material-symbols-outlined">celebration</span>
                        <span>You just hit your weekly goal!</span>
                    </div>
                </div>
            </section>

            {/* ═══ FEATURES ═══ */}
            <section className="landing-features" id="features">
                <div className="landing-features-inner">
                    <div className="landing-section-badge reveal-on-scroll">
                        <span className="material-symbols-outlined">auto_awesome</span>
                        <span>Why Productiv</span>
                    </div>
                    
                    <h2 className="landing-section-title reveal-on-scroll">
                        Engineered for <span className="landing-text-gradient">deep work</span>
                    </h2>

                    <div className="landing-features-showcase">
                        <div className="landing-features-tabs reveal-on-scroll">
                            {features.map((feature, i) => (
                                <button
                                    key={i}
                                    className={`landing-feature-tab ${activeFeature === i ? 'active' : ''}`}
                                    onClick={() => setActiveFeature(i)}
                                >
                                    <span className="landing-feature-tab-icon">
                                        <span className="material-symbols-outlined">{feature.icon}</span>
                                    </span>
                                    <span className="landing-feature-tab-content">
                                        <span className="landing-feature-tab-title">{feature.title}</span>
                                        <span className="landing-feature-tab-desc">{feature.desc}</span>
                                    </span>
                                    <span className="landing-feature-tab-progress"></span>
                                </button>
                            ))}
                        </div>

                        <div className="landing-features-visual reveal-on-scroll">
                            <div className={`landing-feature-visual ${activeFeature === 0 ? 'active' : ''}`}>
                                <div className="landing-velocity-demo">
                                    <div className="landing-keyboard">
                                        <span className="landing-key">⌘</span>
                                        <span className="landing-key-plus">+</span>
                                        <span className="landing-key">K</span>
                                    </div>
                                    <div className="landing-command-palette">
                                        <div className="landing-command-input">
                                            <span className="material-symbols-outlined">search</span>
                                            <span className="landing-typing-cursor">Add task "Ship feature by Friday"</span>
                                        </div>
                                        <div className="landing-command-results">
                                            <div className="landing-command-item active">
                                                <span className="material-symbols-outlined">add_task</span>
                                                <span>Create new task</span>
                                                <span className="landing-command-shortcut">↵</span>
                                            </div>
                                            <div className="landing-command-item">
                                                <span className="material-symbols-outlined">event</span>
                                                <span>Add to calendar</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`landing-feature-visual ${activeFeature === 1 ? 'active' : ''}`}>
                                <div className="landing-ai-demo">
                                    <div className="landing-ai-suggestion">
                                        <div className="landing-ai-header">
                                            <span className="material-symbols-outlined">psychology</span>
                                            <span>Smart Suggestion</span>
                                        </div>
                                        <p>"Based on your patterns, you're most productive on mornings. I've rescheduled your deep work tasks."</p>
                                        <div className="landing-ai-actions">
                                            <button className="landing-ai-accept">Accept</button>
                                            <button className="landing-ai-dismiss">Dismiss</button>
                                        </div>
                                    </div>
                                    <div className="landing-ai-particles"></div>
                                </div>
                            </div>

                            <div className={`landing-feature-visual ${activeFeature === 2 ? 'active' : ''}`}>
                                <div className="landing-timeline-demo">
                                    <div className="landing-timeline-header">This Week</div>
                                    <div className="landing-timeline-days">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                                            <div key={day} className={`landing-timeline-day ${i === 2 ? 'today' : ''}`}>
                                                <span className="landing-timeline-label">{day}</span>
                                                <div className="landing-timeline-blocks">
                                                    {[...Array(Math.floor(Math.random() * 3) + 1)].map((_, j) => (
                                                        <div key={j} className="landing-timeline-block" style={{ 
                                                            height: `${20 + Math.random() * 40}px`,
                                                            background: ['#8b5cf6', '#22c55e', '#f59e0b', '#3b82f6'][Math.floor(Math.random() * 4)]
                                                        }}></div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ SHOWCASE ═══ */}
            <section className="landing-showcase" id="showcase">
                <div className="landing-showcase-inner">
                    <div className="landing-showcase-content reveal-on-scroll">
                        <div className="landing-section-badge">
                            <span className="material-symbols-outlined">widgets</span>
                            <span>The Experience</span>
                        </div>
                        <h2 className="landing-section-title">
                            Three pillars.<br />
                            <span className="landing-text-gradient">One system.</span>
                        </h2>
                        <p className="landing-showcase-desc">
                            Tasks, habits, and deadlines — synchronized. Each one strengthens the others.
                        </p>
                    </div>

                    <div className="landing-pillars">
                        <div className="landing-pillar reveal-on-scroll">
                            <div className="landing-pillar-glow"></div>
                            <div className="landing-pillar-icon">
                                <span className="material-symbols-outlined">task_alt</span>
                            </div>
                            <h3>Tasks</h3>
                            <p>Capture, organize, execute. With priorities that actually make sense.</p>
                            <div className="landing-pillar-visual">
                                <div className="landing-mini-task">
                                    <div className="landing-mini-check"></div>
                                    <span>Ship the feature</span>
                                </div>
                                <div className="landing-mini-task done">
                                    <div className="landing-mini-check done">✓</div>
                                    <span>Review PRs</span>
                                </div>
                            </div>
                        </div>

                        <div className="landing-pillar reveal-on-scroll delay-1">
                            <div className="landing-pillar-glow"></div>
                            <div className="landing-pillar-icon">
                                <span className="material-symbols-outlined">local_fire_department</span>
                            </div>
                            <h3>Habits</h3>
                            <p>Build consistency that compounds. Track streaks that motivate.</p>
                            <div className="landing-pillar-visual">
                                <div className="landing-habit-heatmap">
                                    {[...Array(21)].map((_, i) => (
                                        <div key={i} className={`landing-habit-cell ${Math.random() > 0.3 ? 'filled' : ''}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="landing-pillar reveal-on-scroll delay-2">
                            <div className="landing-pillar-glow"></div>
                            <div className="landing-pillar-icon">
                                <span className="material-symbols-outlined">event_available</span>
                            </div>
                            <h3>Deadlines</h3>
                            <p>See what's coming. Plan with confidence. Never be surprised.</p>
                            <div className="landing-pillar-visual">
                                <div className="landing-mini-deadline">
                                    <div className="landing-deadline-line"></div>
                                    <div className="landing-deadline-marker" style={{ left: '20%' }}></div>
                                    <div className="landing-deadline-marker urgent" style={{ left: '45%' }}></div>
                                    <div className="landing-deadline-marker" style={{ left: '80%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ PHILOSOPHY ═══ */}
            <section className="landing-philosophy" id="philosophy">
                <div className="landing-philosophy-inner">
                    <div className="landing-philosophy-content reveal-on-scroll">
                        <div className="landing-section-badge">
                            <span className="material-symbols-outlined">emoji_objects</span>
                            <span>Our Philosophy</span>
                        </div>
                        <h2 className="landing-philosophy-title">
                            Productivity isn't about<br />
                            doing more things.
                        </h2>
                        <p className="landing-philosophy-quote">
                            It's about doing the <em>right</em> things, with <em>less</em> friction, 
                            so you can focus on what <em>actually</em> matters.
                        </p>
                        <div className="landing-philosophy-author">
                            <div className="landing-philosophy-avatar">P</div>
                            <div>
                                <span className="landing-philosophy-name">Productiv Team</span>
                                <span className="landing-philosophy-role">Building tools for builders</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ FINAL CTA ═══ */}
            <section className="landing-final-cta reveal-on-scroll">
                <div className="landing-final-cta-inner">
                    <div className="landing-final-cta-bg"></div>
                    <h2>Ready to transform how you work?</h2>
                    <p>Join thousands who've made the switch. Free forever for individuals.</p>
                    <Link to="/signup" className="landing-cta-primary landing-cta-glow">
                        <span className="landing-cta-bg"></span>
                        <span className="landing-cta-content">
                            <span>Get started for free</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </span>
                    </Link>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="landing-footer">
                <div className="landing-footer-inner">
                    <div className="landing-footer-brand">
                        <Link to="/" className="landing-logo">
                            <div className="landing-logo-mark">
                                <svg viewBox="0 0 32 32" fill="none">
                                    <rect width="32" height="32" rx="10" fill="url(#logoGrad2)" />
                                    <path d="M9 16L13.5 20.5L23 11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <defs>
                                        <linearGradient id="logoGrad2" x1="0" y1="0" x2="32" y2="32">
                                            <stop stopColor="#8B5CF6" />
                                            <stop offset="1" stopColor="#6366F1" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <span className="landing-logo-text">Productiv</span>
                        </Link>
                        <p>Your mind, beautifully organized.</p>
                    </div>
                    <div className="landing-footer-links">
                        <div className="landing-footer-col">
                            <h4>Product</h4>
                            <a href="#features">Features</a>
                            <a href="#showcase">Experience</a>
                            <a href="#">Pricing</a>
                        </div>
                        <div className="landing-footer-col">
                            <h4>Company</h4>
                            <a href="#">About</a>
                            <a href="#">Blog</a>
                            <a href="#">Careers</a>
                        </div>
                        <div className="landing-footer-col">
                            <h4>Legal</h4>
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                        </div>
                    </div>
                </div>
                <div className="landing-footer-bottom">
                    <p>© {new Date().getFullYear()} Productiv. Crafted with intention.</p>
                </div>
            </footer>
        </div>
    );
}
