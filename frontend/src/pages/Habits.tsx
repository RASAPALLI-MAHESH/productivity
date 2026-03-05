import { useEffect, useState, useMemo } from 'react';
import { useHabitStore } from '../store/habitStore';
import { HabitsIntelligenceHeader } from '../components/HabitsIntelligenceHeader';
import { HabitsCommandBar } from '../components/HabitsCommandBar';
import { HabitRow } from '../components/HabitRow';
import { HabitInlineCreate } from '../components/HabitInlineCreate';
import { HabitAnalyticsDrawer } from '../components/HabitAnalyticsDrawer';
import { HabitDeleteToast } from '../components/HabitDeleteToast';

export function Habits() {
    const {
        habits, loading, error, fetchDashboard,
        searchQuery, sortOption, filterCategory
    } = useHabitStore();

    const [activeAnalyticsHabitId, setActiveAnalyticsHabitId] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if in input
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
                return;
            }

            if (e.key.toLowerCase() === 'h') {
                e.preventDefault();
                const createBtn = document.querySelector('.habit-inline-create-trigger') as HTMLElement;
                if (createBtn) createBtn.click();
            }
            if (e.key === '/') {
                e.preventDefault();
                const searchInput = document.querySelector('.habits-search-input') as HTMLElement;
                if (searchInput) searchInput.focus();
            }
            // For 'D' or 'E', one would need a focused state for rows.
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Derived / Filtered State
    const filteredHabits = useMemo(() => {
        let result = [...habits];

        if (filterCategory !== 'all') {
            result = result.filter(h => h.category === filterCategory);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(h =>
                h.name.toLowerCase().includes(q) ||
                (h.description && h.description.toLowerCase().includes(q))
            );
        }

        switch (sortOption) {
            case 'Most Streak':
                result.sort((a, b) => b.currentStreak - a.currentStreak);
                break;
            case 'Completion Rate':
                // Highly complex, roughly sorting by longestStreak for now, real SaaS uses specific derived metrics
                result.sort((a, b) => b.longestStreak - a.longestStreak);
                break;
            case 'Alphabetical':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'Recently Created':
            default:
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }

        return result;
    }, [habits, filterCategory, searchQuery, sortOption]);

    if (loading && habits.length === 0) {
        return (
            <div className="habits-page">
                <main className="habits-main">
                    <div className="empty-state">Loading Habits Ecosystem...</div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="habits-page">
                <main className="habits-main">
                    <div className="empty-state error">
                        <span className="material-icons text-4xl mb-2 text-red-500">error_outline</span>
                        <p>{error}</p>
                        <button onClick={fetchDashboard} className="mt-4 px-4 py-2 bg-[var(--p-surface)] rounded-md border border-[var(--p-border)] hover:bg-[var(--p-border)] transition-colors text-sm font-medium">Try Again</button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="habits-page">
            <main className="habits-main">
                <header className="habits-page-header">
                    <h1>Habits</h1>
                    <p className="subtitle">Build behavioral pipelines and track momentum.</p>
                </header>

                <HabitsIntelligenceHeader />
                <HabitsCommandBar />

                <div className="habits-list-container">
                    {filteredHabits.length > 0 ? (
                        <div className="habits-list">
                            {filteredHabits.map((habit) => (
                                <HabitRow
                                    key={habit.id}
                                    habit={habit}
                                    onSparklineClick={() => setActiveAnalyticsHabitId(habit.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: '64px 0', border: '1px dashed var(--p-border)', borderRadius: '12px' }}>
                            <span className="material-icons icon-lg" style={{ color: 'var(--p-text-muted)' }}>water_drop</span>
                            <h3>No habits found</h3>
                            <p>Press <kbd>H</kbd> to build a new habit.</p>
                        </div>
                    )}

                    <HabitInlineCreate />
                </div>
            </main>

            {activeAnalyticsHabitId && (
                <HabitAnalyticsDrawer
                    habitId={activeAnalyticsHabitId}
                    onClose={() => setActiveAnalyticsHabitId(null)}
                />
            )}

            <HabitDeleteToast />
        </div>
    );
}
