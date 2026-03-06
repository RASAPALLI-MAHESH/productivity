import { memo, useState } from 'react';
import type { Task } from '../types';

const PRIORITY_COLOR: Record<string, string> = {
    low: 'var(--success, #10b981)',
    medium: 'var(--warning, #f59e0b)',
    high: 'var(--error, #ef4444)',
    critical: 'var(--primary, #8b5cf6)',
};

interface DeadlineRowProps {
    task: Task;
    onToggle: (task: Task) => void;
    onReschedule: (taskId: string, newDeadline: string) => void;
    onEditDate: (task: Task) => void;
    onDelete: (id: string) => void;
}

export const DeadlineRow = memo(({ task, onToggle, onReschedule, onEditDate, onDelete }: DeadlineRowProps) => {
    const [showActions, setShowActions] = useState(false);
    const isDone = task.status === 'done';
    const deadline = task.deadline ? new Date(task.deadline) : null;
    const timeStr = deadline
        ? deadline.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        : '';

    const handleSnoozeTomorrow = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(9, 0, 0, 0);
        onReschedule(task.id, d.toISOString());
    };

    return (
        <div
            className="deadline-row"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <button
                type="button"
                className={`deadline-row__checkbox ${isDone ? 'checked' : ''}`}
                onClick={() => onToggle(task)}
                aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
            >
                <span className="material-symbols-outlined">check</span>
            </button>
            <div className="deadline-row__body">
                <span className={`deadline-row__title ${isDone ? 'done' : ''}`}>{task.title}</span>
                <div className="deadline-row__meta">
                    {timeStr && <span className="deadline-row__time">{timeStr}</span>}
                    <span className="deadline-row__priority-dot" style={{ background: PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.medium }} />
                    <span className="deadline-row__priority-label">{task.priority}</span>
                </div>
            </div>
            <div className={`deadline-row__actions ${showActions ? 'visible' : ''}`}>
                <button type="button" className="deadline-row__action" onClick={() => onEditDate(task)} title="Edit date">
                    <span className="material-symbols-outlined">event</span>
                </button>
                <button type="button" className="deadline-row__action" onClick={handleSnoozeTomorrow} title="Snooze tomorrow">
                    <span className="material-symbols-outlined">schedule</span>
                </button>
                <button type="button" className="deadline-row__action delete" onClick={() => onDelete(task.id)} title="Delete">
                    <span className="material-symbols-outlined">delete</span>
                </button>
            </div>
        </div>
    );
});
