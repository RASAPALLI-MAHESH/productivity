import { useThemeStore } from '../store/themeStore';

interface ThemeToggleProps {
    variant?: 'minimal' | 'full';
}

export function ThemeToggle({ variant = 'minimal' }: ThemeToggleProps) {
    const { theme, setTheme, toggleTheme } = useThemeStore();

    if (variant === 'full') {
        return (
            <div className="theme-card-group">
                <button
                    className={`theme-card ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => setTheme('light')}
                >
                    <div className="theme-card__visual theme-card__visual--light">
                        <span className="material-symbols-outlined theme-card__icon">light_mode</span>
                    </div>
                    <div className="theme-card__info">
                        <span className="theme-card__name">Clean Light</span>
                        <span className="theme-card__desc">Focus & Clarity</span>
                    </div>
                    <div className="theme-card__radio">
                        <div className="theme-card__radio-inner" />
                    </div>
                </button>

                <button
                    className={`theme-card ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setTheme('dark')}
                >
                    <div className="theme-card__visual theme-card__visual--dark">
                        <span className="material-symbols-outlined theme-card__icon">dark_mode</span>
                    </div>
                    <div className="theme-card__info">
                        <span className="theme-card__name">Amoled Dark</span>
                        <span className="theme-card__desc">Deep & Immersive</span>
                    </div>
                    <div className="theme-card__radio">
                        <div className="theme-card__radio-inner" />
                    </div>
                </button>
            </div>
        );
    }

    // Premium Animated Toggle for Dashboard Header
    return (
        <button
            className="theme-toggle-animated"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`theme-icon ${theme === 'dark' ? 'dark' : 'light'}`}
            >
                {theme === 'dark' ? (
                    // Moon Path
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                ) : (
                    // Sun Path
                    <>
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </>
                )}
            </svg>
        </button>
    );
}
