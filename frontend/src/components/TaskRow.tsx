import { memo } from 'react';
import type { Task } from '../types';

interface TaskRowProps {
    task: Task;
    onToggle: (task: Task) => Promise<void> | void;
    onEdit?: (task: Task) => void;
    onDelete: (id: string) => Promise<void> | void;
}

const PRIORITY_CONFIG = {
    low: { color: '#10b981', label: 'Low', glow: 'rgba(16,185,129,0.25)' },
    medium: { color: '#f59e0b', label: 'Medium', glow: 'rgba(245,158,11,0.25)' },
    high: { color: '#ef4444', label: 'High', glow: 'rgba(239,68,68,0.25)' },
    critical: { color: '#8b5cf6', label: 'Critical', glow: 'rgba(139,92,246,0.35)' },
} as const;

export const TaskRow = memo(({ task, onToggle, onEdit, onDelete }: TaskRowProps) => {
    const isDone = task.status === 'done';
    const deadlineDate = task.deadline ? new Date(task.deadline) : null;
    const isOverdue = deadlineDate && deadlineDate < new Date() && !isDone;

    const totalSubtasks = task.subtasks?.length || 0;
    const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
    const hasSubtasks = totalSubtasks > 0;

    const pc = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;

    const formatDate = (date: Date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div
            className={`task-card ${isDone ? 'task-card--done' : ''} task-card--${task.priority}`}
            style={{ '--priority-color': pc.color, '--priority-glow': pc.glow } as React.CSSProperties}
        >
            {/* Priority left border accent */}
            <div className="task-card__accent" />

            {/* Checkbox */}
            <button
                className={`task-card__check ${isDone ? 'task-card__check--checked' : ''}`}
                onClick={(e) => { e.stopPropagation(); onToggle(task); }}
                aria-checked={isDone}
                role="checkbox"
                aria-label={`Mark ${task.title} as ${isDone ? 'incomplete' : 'complete'}`}
                style={{ '--priority-color': pc.color } as React.CSSProperties}
            >
                <span className="material-symbols-outlined task-card__check-icon">check</span>
            </button>

            {/* Main content */}
            <div className="task-card__body" onClick={() => onEdit?.(task)}>
                <div className="task-card__title-row">
                    <span className="task-card__title">{task.title}</span>
                </div>

                {task.description && (
                    <p className="task-card__desc">{task.description}</p>
                )}

                {/* Meta chips */}
                <div className="task-card__meta">
                    {deadlineDate && (
                        <span className={`task-chip ${isOverdue ? 'task-chip--overdue' : 'task-chip--date'}`}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>event</span>
                            {formatDate(deadlineDate)}
                        </span>
                    )}
                    {hasSubtasks && (
                        <span className="task-chip task-chip--subtask">
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>account_tree</span>
                            {completedSubtasks}/{totalSubtasks}
                        </span>
                    )}
                    {task.energyLevel && (
                        <span className={`task-chip task-chip--energy task-chip--energy-${task.energyLevel}`}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                                {task.energyLevel === 'low' ? 'battery_low' : task.energyLevel === 'medium' ? 'battery_50' : 'battery_full'}
                            </span>
                            {task.energyLevel}
                        </span>
                    )}
                    {task.estimatedMinutes && (
                        <span className="task-chip task-chip--estimate">
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>
                            {task.estimatedMinutes}m
                        </span>
                    )}
                </div>
            </div>

            {/* Right side */}
            <div className="task-card__right">
                <span
                    className="task-card__priority-badge"
                    style={{ color: pc.color, background: `${pc.color}18`, borderColor: `${pc.color}30` }}
                >
                    <span className="task-card__priority-dot" style={{ background: pc.color, boxShadow: `0 0 6px ${pc.color}` }} />
                    {pc.label}
                </span>

                <div className="task-card__actions">
                    <button
                        className="task-card__action-btn"
                        title="Edit"
                        onClick={(e) => { e.stopPropagation(); onEdit?.(task); }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>edit_note</span>
                    </button>
                    <button
                        className="task-card__action-btn task-card__action-btn--delete"
                        title="Delete"
                        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
});
