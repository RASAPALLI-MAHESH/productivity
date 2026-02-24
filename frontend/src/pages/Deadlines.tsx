import { useState, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { DeadlinesExecutiveHUD } from '../components/DeadlinesExecutiveHUD';
import { DeadlineCard } from '../components/DeadlineCard';
import { DeadlineInsights } from '../components/DeadlineInsights';
import type { Task } from '../types';

export function Deadlines() {
    const { tasks, updateTask, deleteTask } = useAppStore();
    const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

    const toggleSection = (section: string) => {
        setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const getDaysLeft = (deadline: string) => {
        const d = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        return Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getUrgencyScore = (task: Task) => {
        if (!task.deadline) return 0;
        const days = getDaysLeft(task.deadline);
        const priorityWeight = task.priority === 'high' ? 3 : task.priority === 'medium' ? 2 : 1;
        let timeFactor = 0;

        if (days < 0) timeFactor = 10;
        else if (days === 0) timeFactor = 8;
        else if (days === 1) timeFactor = 6;
        else if (days <= 7) timeFactor = 4;
        else timeFactor = 2;

        return priorityWeight * timeFactor;
    };

    const tasksWithDeadlines = useMemo(() => tasks
        .filter((t) => t.deadline && (t.status === 'todo' || t.status === 'in-progress'))
        .sort((a, b) => getUrgencyScore(b) - getUrgencyScore(a)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [tasks]);

    // Grouping
    const overdue = useMemo(() => tasksWithDeadlines.filter((t: Task) => getDaysLeft(t.deadline!) < 0), [tasksWithDeadlines]);
    const dueToday = useMemo(() => tasksWithDeadlines.filter((t: Task) => getDaysLeft(t.deadline!) === 0), [tasksWithDeadlines]);
    const dueTomorrow = useMemo(() => tasksWithDeadlines.filter((t: Task) => getDaysLeft(t.deadline!) === 1), [tasksWithDeadlines]);
    const upcoming = useMemo(() => tasksWithDeadlines.filter((t: Task) => {
        const days = getDaysLeft(t.deadline!);
        return days > 1 && days <= 7;
    }), [tasksWithDeadlines]);
    const later = useMemo(() => tasksWithDeadlines.filter((t: Task) => getDaysLeft(t.deadline!) > 7), [tasksWithDeadlines]);

    const handleToggle = (task: Task) => {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        updateTask(task.id, { status: newStatus });
    };

    const renderTimeline = () => {
        // Group tasks by date exactly
        const dateGroups: Record<string, Task[]> = {};
        tasksWithDeadlines.forEach(t => {
            const dateStr = new Date(t.deadline!).toDateString();
            if (!dateGroups[dateStr]) dateGroups[dateStr] = [];
            dateGroups[dateStr].push(t);
        });

        const sortedDates = Object.keys(dateGroups).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        return (
            <div className="timeline-view">
                {sortedDates.map(date => (
                    <div key={date} className="timeline-group">
                        <div className="timeline-date-marker">
                            <div className="marker-dot" />
                            <span className="marker-label">
                                {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <div className="marker-line" />
                        </div>
                        <div className="timeline-items" style={{ paddingLeft: '32px', marginBottom: '32px' }}>
                            {dateGroups[date].map(task => (
                                <DeadlineCard
                                    key={task.id}
                                    task={task}
                                    onToggle={handleToggle}
                                    onUpdate={updateTask}
                                    onDelete={deleteTask}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderSection = (id: string, label: string, items: Task[], icon: string, color: string) => {
        if (!items.length) return null;
        const isCollapsed = collapsedSections[id];

        return (
            <div className={`deadline-section ${id}`} style={{ marginBottom: 'var(--space-6)' }}>
                <div
                    className="section-header-elite"
                    onClick={() => toggleSection(id)}
                    style={{
                        opacity: isCollapsed ? 0.7 : 1,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: '1px solid var(--border-subtle)',
                        marginBottom: '12px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`material-symbols-outlined expand-arrow ${isCollapsed ? '' : 'expanded'}`} style={{ fontSize: '18px', transition: 'transform 0.2s' }}>
                            {isCollapsed ? 'chevron_right' : 'expand_more'}
                        </span>
                        <span className="material-symbols-outlined" style={{ color: color, fontSize: '20px' }}>{icon}</span>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{label}</span>
                        <span className="count-badge-tiny">{items.length}</span>
                    </div>
                </div>

                {!isCollapsed && (
                    <div className="deadline-grid">
                        {items.map((task) => (
                            <DeadlineCard
                                key={task.id}
                                task={task}
                                onToggle={handleToggle}
                                onUpdate={updateTask}
                                onDelete={deleteTask}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="deadlines-page-container">
            <div className="page-header" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 className="page-title">Deadlines</h1>
                        <p className="page-subtitle">Strategic overview of your upcoming milestones</p>
                    </div>
                    <div className="view-toggle-elite">
                        <button
                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <span className="material-symbols-outlined">list</span>
                            List
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
                            onClick={() => setViewMode('timeline')}
                        >
                            <span className="material-symbols-outlined">timeline</span>
                            Timeline
                        </button>
                    </div>
                </div>
            </div>

            <DeadlinesExecutiveHUD tasks={tasks} />

            <div className="deadlines-page-layout">
                <div className="deadlines-content-area">
                    {tasksWithDeadlines.length ? (
                        viewMode === 'list' ? (
                            <div className="deadline-sections">
                                {renderSection('overdue', 'Overdue', overdue, 'error', 'var(--accent-critical)')}
                                {renderSection('today', 'Due Today', dueToday, 'bolt', 'var(--primary)')}
                                {renderSection('tomorrow', 'Due Tomorrow', dueTomorrow, 'schedule', 'var(--accent-warning)')}
                                {renderSection('upcoming', 'Upcoming', upcoming, 'event', 'var(--accent-success)')}
                                {renderSection('later', 'Later', later, 'calendar_month', 'var(--text-muted)')}
                            </div>
                        ) : (
                            renderTimeline()
                        )
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon"><span className="material-symbols-outlined">schedule</span></div>
                            <h3>No active deadlines</h3>
                            <p>Add deadlines to your tasks to track them here</p>
                        </div>
                    )}
                </div>

                <div className="deadlines-side-panel">
                    <DeadlineInsights tasks={tasks} />
                </div>
            </div>
        </div>
    );
}
