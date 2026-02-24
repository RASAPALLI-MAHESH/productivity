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
        <div className={`elite-row ${isDone ? 'elite-row--done' : ''}`}>
            {/* Action Bar (Revealed on hover) */}
            <div className="elite-row__actions">
                <button
                    className="elite-row__action-btn"
                    title="Edit"
                    onClick={(e) => { e.stopPropagation(); onEdit?.(task); }}
                >
                    <span className="material-symbols-outlined">edit_note</span>
                </button>
                <button
                    className="elite-row__action-btn elite-row__action-btn--delete"
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                >
                    <span className="material-symbols-outlined">delete</span>
                </button>
            </div>

            {/* Checkbox */}
            <button
                className={`elite-row__checkbox ${isDone ? 'elite-row__checkbox--checked' : ''}`}
                onClick={(e) => { e.stopPropagation(); onToggle(task); }}
                aria-checked={isDone}
                role="checkbox"
                aria-label={`Mark ${task.title} as ${isDone ? 'incomplete' : 'complete'}`}
                style={{ '--accent-color': pc.color } as React.CSSProperties}
            >
                <span className="material-symbols-outlined elite-row__check-icon">check</span>
            </button>

            {/* Content Body */}
            <div className="elite-row__body" onClick={() => onEdit?.(task)}>
                <div className="elite-row__main">
                    <span className="elite-row__title">{task.title}</span>
                    {task.description && (
                        <p className="elite-row__desc">{task.description}</p>
                    )}
                </div>

                {/* Meta Tags */}
                <div className="elite-row__meta">
                    {deadlineDate && (
                        <span className={`elite-tag ${isOverdue ? 'elite-tag--overdue' : ''}`}>
                            <span className="material-symbols-outlined">event</span>
                            {formatDate(deadlineDate)}
                        </span>
                    )}
                    {task.energyLevel && (
                        <span className={`elite-tag elite-tag--energy-${task.energyLevel}`}>
                            <span className="material-symbols-outlined">
                                {task.energyLevel === 'low' ? 'battery_low' : task.energyLevel === 'medium' ? 'battery_50' : 'battery_full'}
                            </span>
                            {task.energyLevel}
                        </span>
                    )}
                </div>
            </div>

            {/* Priority Indicator */}
            <div className="elite-row__priority">
                <span className="elite-row__priority-dot" style={{ background: pc.color }} />
                <span className="elite-row__priority-label">{pc.label}</span>
            </div>
        </div>
    );
});