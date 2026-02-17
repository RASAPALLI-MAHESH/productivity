import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { ThemeToggle } from '../components/ThemeToggle';

export function Dashboard() {
    const { dashboard, dashboardLoading, fetchDashboard, updateTask } = useAppStore();
    const { profile } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const handleStatusToggle = async (task: any) => {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        await updateTask(task.id, { ...task, status: newStatus });
    };

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
        <div className="dashboard-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{greeting}, {profile?.displayName || 'there'}</h1>
                    <p className="page-subtitle">{today}</p>
                </div>
                <div className="header-actions">
                    <ThemeToggle />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">TOTAL TASKS</div>
                    <div className="stat-value">{dashboard?.totalTasks || 0}</div>
                    <div className="stat-icon-wrapper">
                        <span className="material-symbols-outlined">assignment</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">COMPLETED</div>
                    <div className="stat-value">{dashboard?.completedTasks || 0}</div>
                    <div className="stat-icon-wrapper">
                        <span className="material-symbols-outlined">check_circle</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">STREAK DAYS</div>
                    <div className="stat-value">{dashboard?.totalStreakDays || 0}</div>
                    <div className="stat-icon-wrapper" style={{ color: 'var(--warning)' }}>
                        <span className="material-symbols-outlined">local_fire_department</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">OVERDUE</div>
                    <div className="stat-value">{dashboard?.overdueTasks || 0}</div>
                    <div className="stat-icon-wrapper" style={{ color: 'var(--critical)' }}>
                        <span className="material-symbols-outlined">error</span>
                    </div>
                </div>
            </div>

            {/* Two-Column Dashboard Grid */}
            <div className="dashboard-grid">
                {/* 1. Today's Tasks (Top Left) */}
                <div className="card dashboard-section">
                    <div className="card-header">
                        <h2 className="card-title">
                            <span className="material-symbols-outlined icon-sm">today</span>
                            Today's Tasks
                        </h2>
                        <span className="badge badge-medium">{dashboard?.todayTasks?.length || 0}</span>
                    </div>
                    {dashboard?.todayTasks?.length ? (
                        <div className="task-list">
                            {dashboard.todayTasks.map((task) => (
                                <div key={task.id} className="task-item">
                                    <div
                                        className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`}
                                        onClick={() => handleStatusToggle(task)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {task.status === 'done' && <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>}
                                    </div>
                                    <div className="task-info" onClick={() => navigate('/tasks')} style={{ cursor: 'pointer' }}>
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
                            <div className="empty-icon"><span className="material-symbols-outlined">target</span></div>
                            <h3>No tasks due today</h3>
                            <p>Your day is clear — great time to plan ahead.</p>
                        </div>
                    )}
                </div>

                {/* 2. Upcoming Deadlines (Top Right) */}
                <div className="card dashboard-section">
                    <div className="card-header">
                        <h2 className="card-title">
                            <span className="material-symbols-outlined icon-sm">event</span>
                            Upcoming Deadlines
                        </h2>
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
                            <div className="empty-icon"><span className="material-symbols-outlined">event</span></div>
                            <h3>No upcoming deadlines</h3>
                            <p>Add deadlines to tasks to see them here.</p>
                        </div>
                    )}
                </div>

                {/* 3. Overdue Tasks (Bottom Left) */}
                <div className="card dashboard-section">
                    <div className="card-header">
                        <h2 className="card-title">
                            <span className="material-symbols-outlined icon-sm">warning</span>
                            Overdue
                        </h2>
                        <span className="badge badge-critical">{dashboard?.overdueTodayTasks?.length || 0}</span>
                    </div>
                    {dashboard?.overdueTodayTasks?.length ? (
                        <div className="task-list">
                            {dashboard.overdueTodayTasks.map((task) => (
                                <div key={task.id} className="task-item" style={{ borderLeft: '3px solid var(--critical)' }}>
                                    <div
                                        className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`}
                                        onClick={() => handleStatusToggle(task)}
                                        style={{ cursor: 'pointer', marginRight: '12px' }}
                                    >
                                        {task.status === 'done' && <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>}
                                    </div>
                                    <div className="task-info" onClick={() => navigate('/tasks')} style={{ cursor: 'pointer' }}>
                                        <div className="task-title">{task.title}</div>
                                        <div className="task-meta">
                                            <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                                            {task.deadline && (
                                                <span style={{ color: 'var(--critical)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <span className="material-symbols-outlined icon-sm">event</span>
                                                    {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                            <div className="empty-icon"><span className="material-symbols-outlined">celebration</span></div>
                            <h3>All caught up!</h3>
                            <p>No overdue tasks. Keep the momentum going.</p>
                        </div>
                    )}
                </div>

                {/* 4. Quick Habits (Bottom Right) */}
                <div className="card dashboard-section">
                    <div className="card-header">
                        <h2 className="card-title">
                            <span className="material-symbols-outlined icon-sm">local_fire_department</span>
                            Habit Streaks
                        </h2>
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
                                    <span className="habit-streak">
                                        <span className="material-symbols-outlined icon-sm">local_fire_department</span>
                                        {habit.currentStreak}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                            <div className="empty-icon"><span className="material-symbols-outlined">fitness_center</span></div>
                            <h3>No habits yet</h3>
                            <p>Build momentum. Start with one small daily habit.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
