import { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { HabitCard } from '../components/HabitCard';
import { HabitCreatePanel } from '../components/HabitCreatePanel';
import { HabitAnalytics } from '../components/HabitAnalytics';
import { HabitsIntelligenceHeader } from '../components/HabitsIntelligenceHeader';

export function Habits() {
    const {
        habits, habitLoading, habitLogs, focusMode,
        fetchHabits, createHabit, deleteHabit, completeHabit, fetchHabitLogs, setFocusMode
    } = useAppStore();

    const [showCreate, setShowCreate] = useState(false);
    const [selectedAnalyticsId, setSelectedAnalyticsId] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.key.toLowerCase()) {
                case 'h':
                    e.preventDefault();
                    setShowCreate(true);
                    break;
                case 'f':
                    e.preventDefault();
                    setFocusMode(!focusMode);
                    break;
                case 'd':
                    e.preventDefault();
                    // Mark first pending habit as done (for quick D workflow)
                    const todayStr = new Date().toISOString().split('T')[0];
                    const firstPending = habits.find(h => h.lastCompletedDate !== todayStr);
                    if (firstPending) completeHabit(firstPending.id);
                    break;
                case 'arrowleft':
                    setViewMode('weekly');
                    break;
                case 'arrowright':
                    setViewMode('monthly');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [focusMode, habits, completeHabit, setFocusMode]);

    useEffect(() => {
        fetchHabits();
    }, [fetchHabits]);

    // Pre-fetch logs for all habits to populate cards
    useEffect(() => {
        if (habits.length > 0) {
            const end = new Date().toISOString().split('T')[0];
            const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            habits.forEach(habit => {
                if (!habitLogs[habit.id]) {
                    fetchHabitLogs(habit.id, start, end);
                }
            });
        }
    }, [habits, fetchHabitLogs, habitLogs]);

    const filteredHabits = useMemo(() => {
        if (filterCategory === 'all') return habits;
        return habits.filter(h => h.category === filterCategory);
    }, [habits, filterCategory]);

    const analyticsHabit = useMemo(() =>
        habits.find(h => h.id === selectedAnalyticsId) || null
        , [habits, selectedAnalyticsId]);

    const categories = ['all', 'health', 'learning', 'work', 'personal'];

    const [activeIndex, setActiveIndex] = useState(-1);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                setActiveIndex(prev => (prev + 1) % filteredHabits.length);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                setActiveIndex(prev => (prev - 1 + filteredHabits.length) % filteredHabits.length);
            } else if (e.key === ' ' && activeIndex >= 0) {
                e.preventDefault();
                completeHabit(filteredHabits[activeIndex].id);
            } else if (e.key === 'Enter' && activeIndex >= 0) {
                setSelectedAnalyticsId(filteredHabits[activeIndex].id);
            } else if (e.key === 'f') {
                setFocusMode(!focusMode);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredHabits, activeIndex, focusMode]);

    return (
        <div className={`habits-page-container ${focusMode ? 'focus-mode' : ''}`}>
            {!focusMode && <HabitsIntelligenceHeader />}

            <div className="habits-toolbar-elite">
                <div className="filter-group-elite">
                    <div className="segmented-control-elite">
                        <button
                            className={`seg-btn ${viewMode === 'weekly' ? 'active' : ''}`}
                            onClick={() => setViewMode('weekly')}
                        >
                            Weekly
                        </button>
                        <button
                            className={`seg-btn ${viewMode === 'monthly' ? 'active' : ''}`}
                            onClick={() => setViewMode('monthly')}
                        >
                            Monthly
                        </button>
                    </div>

                    <div className="vertical-divider" style={{ width: '1px', height: '20px', background: 'var(--p-border)' }} />

                    <div className="category-pills">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`cat-pill ${filterCategory === cat ? 'active' : ''}`}
                                onClick={() => setFilterCategory(cat)}
                            >
                                <span className={`dot ${cat}`} />
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="action-group-elite">
                    <button
                        className={`btn-elite ${focusMode ? 'active' : ''}`}
                        onClick={() => setFocusMode(!focusMode)}
                        title="Focus Mode (F)"
                    >
                        <span className="material-symbols-outlined icon-sm">
                            {focusMode ? 'center_focus_strong' : 'center_focus_weak'}
                        </span>
                        {focusMode ? 'Exit Focus' : 'Focus Mode'}
                    </button>

                    <button className="btn-primary-elite" onClick={() => setShowCreate(true)}>
                        <span className="material-symbols-outlined icon-sm">add</span>
                        New Habit
                    </button>
                </div>
            </div>

            {habitLoading && !habits.length ? (
                <div className="loader"><div className="spinner" /></div>
            ) : filteredHabits.length ? (
                <div className="habit-grid-elite">
                    {filteredHabits.map((habit, index) => (
                        <HabitCard
                            key={habit.id}
                            habit={habit}
                            logs={habitLogs[habit.id] || []}
                            isActive={activeIndex === index}
                            onComplete={completeHabit}
                            onDelete={deleteHabit}
                            onToggleAnalytics={(id) => setSelectedAnalyticsId(id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-state" style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--border)', borderRadius: '24px', padding: '64px' }}>
                    <div className="empty-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>spa</span>
                    </div>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '24px' }}>Start with 1 small habit</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '12px auto 32px' }}>
                        "Tiny changes, remarkable results." Build your first streak today and transform your trajectory.
                    </p>
                    <button className="btn btn-primary btn-lg" onClick={() => setShowCreate(true)} style={{ width: 'auto', padding: '0 32px' }}>
                        Create your first habit
                    </button>
                </div>
            )}

            {/* Creation Panel */}
            {showCreate && (
                <HabitCreatePanel
                    onClose={() => setShowCreate(false)}
                    onCreate={createHabit}
                />
            )}

            {/* Analytics Side Panel */}
            {selectedAnalyticsId && (
                <>
                    <div className="modal-overlay" onClick={() => setSelectedAnalyticsId(null)} style={{ background: 'transparent' }} />
                    <HabitAnalytics
                        habit={analyticsHabit}
                        logs={habitLogs[selectedAnalyticsId] || []}
                        onClose={() => setSelectedAnalyticsId(null)}
                    />
                </>
            )}
        </div>
    );
}
