import { useEffect, useState, useMemo } from 'react';
import { useHabitStore } from '../store/habitStore';
import { HabitRow } from '../components/HabitRow';
import { HabitInlineCreate } from '../components/HabitInlineCreate';
import { HabitAnalyticsDrawer } from '../components/HabitAnalyticsDrawer';
import { HabitDeleteToast } from '../components/HabitDeleteToast';

export function Habits() {
    const {
        habits, loading, error, fetchDashboard, intelligence,
        searchQuery, sortOption, filterCategory,
        setSearchQuery, setFilterCategory
    } = useHabitStore();

    const [activeAnalyticsHabitId, setActiveAnalyticsHabitId] = useState<string | null>(null);
    const [panelOpen, setPanelOpen] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
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
            // Toggle panel with 'i'
            if (e.key.toLowerCase() === 'i') {
                e.preventDefault();
                setPanelOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Filter & Sort
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
                result.sort((a, b) => b.longestStreak - a.longestStreak);
                break;
            case 'Alphabetical':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return result;
    }, [habits, filterCategory, searchQuery, sortOption]);

    // Computed stats
    const totalHabits = habits.length;
    const completedToday = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const { habitLogs } = useHabitStore.getState();
        return habits.filter(h => {
            const logs = habitLogs[h.id] || [];
            return logs.some(l => l.date === todayStr && l.completed);
        }).length;
    }, [habits]);
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    // Loading
    if (loading && habits.length === 0) {
        return (
            <div className="habits-page">
                <div className="habits-layout">
                    <div className="habits-main-content">
                        <div className="habits-empty">
                            <p style={{ color: 'var(--text-muted)' }}>Loading habits...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="habits-page">
                <div className="habits-layout">
                    <div className="habits-main-content">
                        <div className="habits-empty">
                            <div className="habits-empty-icon">
                                <span className="material-symbols-outlined">error</span>
                            </div>
                            <h3>Something went wrong</h3>
                            <p>{error}</p>
                            <button onClick={fetchDashboard} className="btn-primary" style={{ marginTop: 8 }}>
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="habits-page">
            <div className={`habits-layout${panelOpen ? ' panel-open' : ''}`}>
                {/* ── Main Content Area ── */}
                <div className="habits-main-content">
                    {/* Header */}
                    <div className="habits-header">
                        <div className="habits-header-title">
                            <h1>Habits</h1>
                            <div className="habits-header-meta">
                                <span>{totalHabits} habit{totalHabits !== 1 ? 's' : ''}</span>
                                <span>•</span>
                                <span>{completedToday} done today</span>
                                {intelligence.longestStreak > 0 && (
                                    <>
                                        <span>•</span>
                                        <span className="habits-header-streak">
                                            <span className="material-symbols-outlined">local_fire_department</span>
                                            {intelligence.longestStreak} best streak
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="habits-controls">
                            {/* Search */}
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="habits-search-input"
                                    placeholder="Search habits..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        height: 32,
                                        padding: '0 12px 0 32px',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--text-primary)',
                                        fontSize: 13,
                                        outline: 'none',
                                        width: 180,
                                        transition: 'border-color 150ms ease',
                                    }}
                                />
                                <span
                                    className="material-symbols-outlined"
                                    style={{
                                        position: 'absolute', left: 8, top: '50%',
                                        transform: 'translateY(-50%)', fontSize: 16,
                                        color: 'var(--text-muted)', pointerEvents: 'none',
                                    }}
                                >search</span>
                            </div>

                            {/* Category Filter */}
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="habits-filter-select"
                            >
                                <option value="all">All</option>
                                <option value="health">Health</option>
                                <option value="learning">Learning</option>
                                <option value="work">Work</option>
                                <option value="personal">Personal</option>
                            </select>

                            {/* Panel Toggle */}
                            <button
                                className="panel-toggle-btn"
                                onClick={() => setPanelOpen(prev => !prev)}
                                title={panelOpen ? 'Hide insights (I)' : 'Show insights (I)'}
                            >
                                <span className="material-symbols-outlined">
                                    {panelOpen ? 'right_panel_close' : 'right_panel_open'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Inline Create (Moved to top) */}
                    <HabitInlineCreate />

                    {/* Habit List */}
                    {filteredHabits.length > 0 ? (
                        <div className="habits-list">
                            {filteredHabits.map((habit, index) => (
                                <HabitRow
                                    key={habit.id}
                                    habit={habit}
                                    index={index}
                                    onSparklineClick={() => setActiveAnalyticsHabitId(habit.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="habits-empty">
                            <div className="habits-empty-icon">
                                <span className="material-symbols-outlined">routine</span>
                            </div>
                            <h3>Start building better habits</h3>
                            <p>Small daily actions compound into extraordinary results. Create your first habit to get started.</p>
                        </div>
                    )}
                </div>

                {/* ── Right Insight Panel (Collapsible) ── */}
                <aside className={`habits-insight-panel${panelOpen ? ' open' : ''}`}>
                    <div className="insight-panel-inner">
                        <div className="insight-section">
                            <h3 className="insight-section-title">Today's Progress</h3>
                            <div className="insight-progress-wrap">
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{completedToday} of {totalHabits}</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{completionRate}%</span>
                                </div>
                                <div className="insight-progress-bar">
                                    <div className="insight-progress-fill" style={{ width: `${completionRate}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="insight-section">
                            <h3 className="insight-section-title">Statistics</h3>
                            <div className="insight-tile">
                                <span className="insight-tile-label">Completion Rate</span>
                                <span className="insight-tile-value">{intelligence.weeklyCompletionRate}%</span>
                            </div>
                            <div className="insight-tile">
                                <span className="insight-tile-label">Longest Streak</span>
                                <span className="insight-tile-value">{intelligence.longestStreak} days</span>
                            </div>
                            <div className="insight-tile">
                                <span className="insight-tile-label">Consistency</span>
                                <span className="insight-tile-value">{intelligence.consistencyScore}%</span>
                            </div>
                            <div className="insight-tile">
                                <span className="insight-tile-label">At Risk</span>
                                <span className="insight-tile-value" style={{ color: intelligence.riskCount > 0 ? 'var(--error)' : 'var(--text-primary)' }}>
                                    {intelligence.riskCount} habit{intelligence.riskCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        <div className="insight-section">
                            <h3 className="insight-section-title">Keyboard Shortcuts</h3>
                            <div className="insight-tile">
                                <span className="insight-tile-label">New habit</span>
                                <kbd className="kbd-key">H</kbd>
                            </div>
                            <div className="insight-tile">
                                <span className="insight-tile-label">Search</span>
                                <kbd className="kbd-key">/</kbd>
                            </div>
                            <div className="insight-tile">
                                <span className="insight-tile-label">Toggle panel</span>
                                <kbd className="kbd-key">I</kbd>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

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
