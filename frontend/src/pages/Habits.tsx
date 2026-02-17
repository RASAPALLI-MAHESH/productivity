import { useEffect, useState, FormEvent } from 'react';
import { useAppStore } from '../store/appStore';

export function Habits() {
    const {
        habits, habitLoading, habitLogs,
        fetchHabits, createHabit, deleteHabit, completeHabit, fetchHabitLogs,
    } = useAppStore();
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

    useEffect(() => {
        fetchHabits();
    }, [fetchHabits]);

    useEffect(() => {
        if (selectedHabitId) {
            const end = new Date().toISOString().split('T')[0];
            const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            fetchHabitLogs(selectedHabitId, start, end);
        }
    }, [selectedHabitId, fetchHabitLogs]);

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        await createHabit({ name, description });
        setName('');
        setDescription('');
        setShowModal(false);
    };

    const todayStr = new Date().toISOString().split('T')[0];

    const generateHeatmapDays = () => {
        const days = [];
        for (let i = 27; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    };

    const heatmapDays = generateHeatmapDays();

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Habits</h1>
                    <p className="page-subtitle">Build consistency, track your streaks</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <span className="material-symbols-outlined icon-sm">add</span>
                    New Habit
                </button>
            </div>

            {habitLoading && !habits.length ? (
                <div className="loader"><div className="spinner" /></div>
            ) : habits.length ? (
                <div className="habit-grid">
                    {habits.map((habit) => {
                        const completedToday = habit.lastCompletedDate === todayStr;
                        const logs = habitLogs[habit.id] || [];
                        const logDates = new Set(logs.filter(l => l.completed).map(l => l.date));

                        return (
                            <div key={habit.id} className="habit-card">
                                <div className="habit-header">
                                    <div>
                                        <div className="habit-name">{habit.name}</div>
                                        {habit.description && (
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
                                                {habit.description}
                                            </div>
                                        )}
                                    </div>
                                    <div className="habit-streak">
                                        <span className="material-symbols-outlined icon-sm">local_fire_department</span>
                                        {habit.currentStreak}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                    <span>Best: {habit.longestStreak} days</span>
                                    <span>Current: {habit.currentStreak} days</span>
                                </div>

                                {/* Mini Heatmap */}
                                <div
                                    className="heatmap"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setSelectedHabitId(selectedHabitId === habit.id ? null : habit.id)}
                                >
                                    {heatmapDays.map((day) => (
                                        <div
                                            key={day}
                                            className={`heatmap-cell ${logDates.has(day) || (completedToday && day === todayStr) ? 'active' : ''} ${day === todayStr ? 'today' : ''}`}
                                            title={day}
                                        />
                                    ))}
                                </div>

                                <button
                                    className={`habit-complete-btn ${completedToday ? 'completed' : ''}`}
                                    onClick={() => !completedToday && completeHabit(habit.id)}
                                    disabled={completedToday}
                                    style={{ marginTop: 'var(--space-4)' }}
                                >
                                    {completedToday ? (
                                        <><span className="material-symbols-outlined icon-sm" style={{ verticalAlign: 'text-bottom' }}>check_circle</span> Done today</>
                                    ) : (
                                        <><span className="material-symbols-outlined icon-sm" style={{ verticalAlign: 'text-bottom' }}>radio_button_unchecked</span> Mark complete</>
                                    )}
                                </button>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
                                    <button className="btn-icon" onClick={() => deleteHabit(habit.id)} style={{ color: 'var(--text-muted)' }}>
                                        <span className="material-symbols-outlined icon-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon"><span className="material-symbols-outlined">fitness_center</span></div>
                    <h3>Build momentum</h3>
                    <p>Start with one small daily habit. Consistency beats intensity.</p>
                    <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => setShowModal(true)}>
                        <span className="material-symbols-outlined icon-sm">add</span>
                        Create your first habit
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">New Habit</h2>
                        <form onSubmit={handleCreate}>
                            <div className="input-group">
                                <label className="input-label">Habit Name</label>
                                <input className="input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Read 30 minutes" />
                            </div>
                            <div className="input-group" style={{ marginTop: 'var(--space-4)' }}>
                                <label className="input-label">Description (optional)</label>
                                <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why is this habit important?" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Habit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
