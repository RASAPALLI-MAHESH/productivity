import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

export function Dashboard() {
    const { dashboard, dashboardLoading, fetchDashboard } = useAppStore();
    const { profile } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    if (dashboardLoading && !dashboard) {
        return <div className="loader"><div className="spinner" /></div>;
    }

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const greeting = (() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    })();

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">{greeting}, {profile?.displayName || 'there'} 👋</h1>
                    <p className="page-subtitle">{today}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Total Tasks</div>
                            <div className="stat-value">{dashboard?.totalTasks || 0}</div>
                        </div>
                        <div className="stat-icon">📋</div>
                    </div>
                </div>
                <div className="stat-card success">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Completed</div>
                            <div className="stat-value">{dashboard?.completedTasks || 0}</div>
                        </div>
                        <div className="stat-icon">✅</div>
                    </div>
                </div>
                <div className="stat-card danger">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Overdue</div>
                            <div className="stat-value">{dashboard?.overdueTasks || 0}</div>
                        </div>
                        <div className="stat-icon">🚨</div>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Streak Days</div>
                            <div className="stat-value">{dashboard?.totalStreakDays || 0}</div>
                        </div>
                        <div className="stat-icon">🔥</div>
                    </div>
                </div>
            </div>

            {/* Two-Column Dashboard Grid */}
            <div className="dashboard-grid">
                {/* Left Column — Primary Content */}
                <div>
                    {/* Today's Tasks */}
                    <div className="card dashboard-section">
                        <div className="card-header">
                            <h2 className="card-title">Today's Tasks</h2>
                            <span className="badge badge-medium">{dashboard?.todayTasks?.length || 0}</span>
                        </div>
                        {dashboard?.todayTasks?.length ? (
                            <div className="task-list">
                                {dashboard.todayTasks.map((task) => (
                                    <div key={task.id} className="task-item">
                                        <div className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`}>
                                            {task.status === 'done' ? '✓' : ''}
                                        </div>
                                        <div className="task-info">
                                            <div className={`task-title ${task.status === 'done' ? 'completed' : ''}`}>
                                                {task.title}
                                            </div>
                                            <div className="task-meta">
                                                <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                                <div className="empty-icon">🎯</div>
                                <h3>No tasks due today</h3>
                                <p>Your day is clear — great time to plan ahead.</p>
                            </div>
                        )}
                    </div>

                    {/* Overdue Tasks */}
                    <div className="card dashboard-section">
                        <div className="card-header">
                            <h2 className="card-title">Overdue</h2>
                            <span className="badge badge-critical">{dashboard?.overdueTodayTasks?.length || 0}</span>
                        </div>
                        {dashboard?.overdueTodayTasks?.length ? (
                            <div className="task-list">
                                {dashboard.overdueTodayTasks.map((task) => (
                                    <div key={task.id} className="task-item" style={{ borderLeft: '3px solid var(--critical)' }}>
                                        <div className="task-info">
                                            <div className="task-title">{task.title}</div>
                                            <div className="task-meta">
                                                <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                                                {task.deadline && (
                                                    <span style={{ color: 'var(--critical)' }}>
                                                        📅 {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                                <div className="empty-icon">🎉</div>
                                <h3>All caught up!</h3>
                                <p>No overdue tasks. Keep the momentum going.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column — Secondary Content */}
                <div>
                    {/* Upcoming Deadlines */}
                    <div className="card dashboard-section">
                        <div className="card-header">
                            <h2 className="card-title">Upcoming Deadlines</h2>
                        </div>
                        {dashboard?.upcomingDeadlines?.length ? (
                            <div className="task-list">
                                {dashboard.upcomingDeadlines.slice(0, 5).map((task) => {
                                    const daysLeft = task.deadline
                                        ? Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                                        : null;
                                    const urgency = daysLeft !== null
                                        ? daysLeft <= 1 ? 'urgent' : daysLeft <= 3 ? 'warning' : 'safe'
                                        : 'safe';

                                    return (
                                        <div key={task.id} className={`deadline-item ${urgency}`}>
                                            <div className="deadline-countdown">
                                                <div className="days" style={{
                                                    color: urgency === 'urgent' ? 'var(--critical)'
                                                        : urgency === 'warning' ? 'var(--warning)'
                                                            : 'var(--success)'
                                                }}>
                                                    {daysLeft !== null ? (daysLeft < 0 ? 0 : daysLeft) : '–'}
                                                </div>
                                                <div className="label">days</div>
                                            </div>
                                            <div className="task-info">
                                                <div className="task-title">{task.title}</div>
                                                <div className="task-meta">
                                                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                                <div className="empty-icon">📅</div>
                                <h3>No upcoming deadlines</h3>
                                <p>Add deadlines to tasks to see them here.</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Habits */}
                    <div className="card dashboard-section">
                        <div className="card-header">
                            <h2 className="card-title">Habit Streaks</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/habits')}>View all</button>
                        </div>
                        {dashboard?.habits?.length ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {dashboard.habits.map((habit) => (
                                    <div key={habit.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 'var(--space-3) var(--space-4)',
                                        background: 'var(--bg-input)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                    }}>
                                        <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{habit.name}</span>
                                        <span className="habit-streak">🔥 {habit.currentStreak}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                                <div className="empty-icon">💪</div>
                                <h3>No habits yet</h3>
                                <p>Build momentum. Start with one small daily habit.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
