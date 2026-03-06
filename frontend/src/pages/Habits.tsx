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
    const [panelCalendarMonth, setPanelCalendarMonth] = useState(() => new Date());
    const [panelSelectedDate, setPanelSelectedDate] = useState<Date | null>(() => new Date());
    const [panelTimeHour, setPanelTimeHour] = useState(9);
    const [panelTimeMinute, setPanelTimeMinute] = useState(0);
    const [panelTimeAmpm, setPanelTimeAmpm] = useState<'am' | 'pm'>('am');

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

    // Panel calendar: current month grid
    const panelCalendarDays = useMemo(() => {
        const y = panelCalendarMonth.getFullYear();
        const m = panelCalendarMonth.getMonth();
        const first = new Date(y, m, 1).getDay();
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const days: (number | null)[] = [];
        for (let i = 0; i < first; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    }, [panelCalendarMonth]);

    const panelSelectDate = (day: number) => {
        const d = new Date(panelCalendarMonth.getFullYear(), panelCalendarMonth.getMonth(), day);
        setPanelSelectedDate(d);
    };

    const isToday = (day: number | null) => {
        if (!day) return false;
        const now = new Date();
        return panelCalendarMonth.getFullYear() === now.getFullYear() &&
            panelCalendarMonth.getMonth() === now.getMonth() && day === now.getDate();
    };
    const isSelected = (day: number | null) => {
        if (!day || !panelSelectedDate) return false;
        return panelCalendarMonth.getFullYear() === panelSelectedDate.getFullYear() &&
            panelCalendarMonth.getMonth() === panelSelectedDate.getMonth() && day === panelSelectedDate.getDate();
    };

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

                            {/* Show insights when panel closed (panel toggle lives in right panel) */}
                            {!panelOpen && (
                                <button
                                    className="panel-toggle-btn"
                                    onClick={() => setPanelOpen(true)}
                                    title="Show insights (I)"
                                >
                                    <span className="material-symbols-outlined">right_panel_open</span>
                                </button>
                            )}
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

                {/* ── Right Insight Panel (Today's Progress, Statistics, Shortcuts) ── */}
                <aside className={`habits-insight-panel${panelOpen ? ' open' : ''}`}>
                    <div className="insight-panel-inner">
                        <div className="insight-panel-header">
                            <h3 className="insight-panel-header-title">Today&apos;s Progress</h3>
                            <button
                                type="button"
                                className="insight-panel-hide-btn"
                                onClick={() => setPanelOpen(false)}
                                title="Hide insights (I)"
                                aria-label="Hide insights panel"
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                                <span>Hide</span>
                            </button>
                        </div>

                        <div className="insight-section habits-panel-calendar-section">
                            <h3 className="insight-section-title">Date &amp; time</h3>
                            <div className="habits-panel-calendar">
                                <div className="habits-panel-calendar-header">
                                    <span className="habits-panel-calendar-month">
                                        {panelCalendarMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </span>
                                    <div className="habits-panel-calendar-nav">
                                        <button
                                            type="button"
                                            className="habits-panel-calendar-nav-btn"
                                            onClick={() => setPanelCalendarMonth(new Date(panelCalendarMonth.getFullYear(), panelCalendarMonth.getMonth() - 1))}
                                            aria-label="Previous month"
                                        >
                                            <span className="material-symbols-outlined">chevron_left</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="habits-panel-calendar-nav-btn"
                                            onClick={() => setPanelCalendarMonth(new Date(panelCalendarMonth.getFullYear(), panelCalendarMonth.getMonth() + 1))}
                                            aria-label="Next month"
                                        >
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="habits-panel-calendar-weekdays">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="habits-panel-weekday">{d}</span>)}
                                </div>
                                <div className="habits-panel-calendar-grid">
                                    {panelCalendarDays.map((day, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            className={`habits-panel-day ${day === null ? 'empty' : ''} ${day !== null && isToday(day) ? 'today' : ''} ${day !== null && isSelected(day) ? 'selected' : ''}`}
                                            disabled={day === null}
                                            onClick={() => day !== null && panelSelectDate(day)}
                                        >
                                            {day ?? ''}
                                        </button>
                                    ))}
                                </div>
                                <div className="habits-panel-time">
                                    <span className="material-symbols-outlined habits-panel-time-icon">schedule</span>
                                    <select
                                        className="habits-panel-time-select"
                                        value={panelTimeHour}
                                        onChange={(e) => setPanelTimeHour(Number(e.target.value))}
                                        aria-label="Hour"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                    <span className="habits-panel-time-sep">:</span>
                                    <select
                                        className="habits-panel-time-select"
                                        value={panelTimeMinute}
                                        onChange={(e) => setPanelTimeMinute(Number(e.target.value))}
                                        aria-label="Minute"
                                    >
                                        {[0, 15, 30, 45].map(m => (
                                            <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="habits-panel-time-select habits-panel-time-ampm"
                                        value={panelTimeAmpm}
                                        onChange={(e) => setPanelTimeAmpm(e.target.value as 'am' | 'pm')}
                                        aria-label="AM/PM"
                                    >
                                        <option value="am">AM</option>
                                        <option value="pm">PM</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="insight-section">
                            <h3 className="insight-section-title">Progress</h3>
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
