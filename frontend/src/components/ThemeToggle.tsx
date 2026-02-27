import { useThemeStore } from '../store/themeStore';

interface ThemeToggleProps {
    variant?: 'minimal' | 'full';
}

export function ThemeToggle({ variant = 'minimal' }: ThemeToggleProps) {
    const { theme, setTheme, toggleTheme } = useThemeStore();

    if (variant === 'full') {
        // Professional animated pill toggle for Settings page
        return (
            <div className="theme-pill-toggle" role="group" aria-label="Theme selection">
                <button
                    className={`theme-pill-option ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => setTheme('light')}
                    aria-pressed={theme === 'light'}
                    title="Light Mode"
                >
                    <span className="material-symbols-outlined theme-pill-icon">light_mode</span>
                    <span className="theme-pill-label">Light</span>
                </button>
                <button
                    className={`theme-pill-option ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setTheme('dark')}
                    aria-pressed={theme === 'dark'}
                    title="Dark Mode"
                >
                    <span className="material-symbols-outlined theme-pill-icon">dark_mode</span>
                    <span className="theme-pill-label">Dark</span>
                </button>
            </div>
        );
    }

    // Compact animated icon toggle for sidebar / header
    return (
        <button
            className="theme-toggle-animated"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <span className={`material-symbols-outlined ${theme === 'dark' ? 'icon-filled' : ''}`}>
                {theme === 'dark' ? 'dark_mode' : 'light_mode'}
            </span>
        </button>
    );
}
