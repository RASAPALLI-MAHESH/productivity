import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

export function Deadlines() {
    const { tasks, taskLoading, fetchTasks } = useAppStore();

    useEffect(() => {
        fetchTasks({ sortBy: 'deadline', sortDirection: 'asc', size: 50 });
    }, [fetchTasks]);

    const tasksWithDeadlines = tasks
        .filter((t) => t.deadline && t.status !== 'done')
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

    const getDaysLeft = (deadline: string) => {
        return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    };

    const getUrgency = (daysLeft: number) => {
        if (daysLeft < 0) return 'urgent';
        if (daysLeft <= 1) return 'urgent';
        if (daysLeft <= 3) return 'warning';
        if (daysLeft <= 7) return 'safe';
        return 'safe';
    };

    // Group by urgency
    const overdue = tasksWithDeadlines.filter((t) => getDaysLeft(t.deadline!) < 0);
    const dueToday = tasksWithDeadlines.filter((t) => getDaysLeft(t.deadline!) === 0);
    const dueSoon = tasksWithDeadlines.filter((t) => {
        const days = getDaysLeft(t.deadline!);
        return days > 0 && days <= 3;
    });
    const upcoming = tasksWithDeadlines.filter((t) => {
        const days = getDaysLeft(t.deadline!);
        return days > 3;
    });

    const renderGroup = (label: string, items: typeof tasksWithDeadlines, icon: string) => {
        if (!items.length) return null;
        return (
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <span className="material-symbols-outlined icon-sm">{icon}</span>
                    {label}
                    <span className="badge badge-medium" style={{ marginLeft: 'var(--space-2)' }}>{items.length}</span>
                </h2>
                <div className="task-list">
                    {items.map((task) => {
                        const daysLeft = getDaysLeft(task.deadline!);
                        const urgency = getUrgency(daysLeft);

                        return (
                            <div key={task.id} className={`deadline-item ${urgency}`}>
                                <div className="deadline-countdown">
                                    <div
                                        className="days"
                                        style={{
                                            color: urgency === 'urgent' ? 'var(--accent-critical)'
                                                : urgency === 'warning' ? 'var(--accent-warning)'
                                                    : 'var(--accent-success)',
                                        }}
                                    >
                                        {Math.abs(daysLeft)}
                                    </div>
                                    <div className="label">
                                        {daysLeft < 0 ? 'days ago' : daysLeft === 0 ? 'today' : 'days left'}
                                    </div>
                                </div>
                                <div className="task-info">
                                    <div className="task-title">{task.title}</div>
                                    <div className="task-meta">
                                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                                        <span className={`badge badge-${task.status}`}>{task.status}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span className="material-symbols-outlined icon-sm">event</span>
                                            {new Date(task.deadline!).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (taskLoading && !tasks.length) {
        return <div className="loader"><div className="spinner" /></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Deadlines</h1>
                    <p className="page-subtitle">Stay ahead of your deadlines</p>
                </div>
            </div>

            {tasksWithDeadlines.length ? (
                <>
                    {renderGroup('Overdue', overdue, 'error')}
                    {renderGroup('Due Today', dueToday, 'bolt')}
                    {renderGroup('Due Soon (1-3 days)', dueSoon, 'hourglass_top')}
                    {renderGroup('Upcoming', upcoming, 'event')}
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon"><span className="material-symbols-outlined">schedule</span></div>
                    <h3>No active deadlines</h3>
                    <p>Add deadlines to your tasks to track them here</p>
                </div>
            )}
        </div>
    );
}
