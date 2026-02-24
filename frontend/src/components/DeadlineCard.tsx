import { memo, useState } from 'react';
import type { Task } from '../types';

interface DeadlineCardProps {
    task: Task;
    onToggle: (task: Task) => void;
    onUpdate: (id: string, task: Partial<Task>) => void;
    onDelete: (id: string) => void;
}

export const DeadlineCard = memo(({ task, onToggle, onUpdate, onDelete }: DeadlineCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const getDaysLeft = (deadline: string) => {
        const d = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        return Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getCountdown = (deadline: string) => {
        const days = getDaysLeft(deadline);
        if (days < 0) return `Overdue by ${Math.abs(days)}d`;
        if (days === 0) return 'Due today';
        if (days === 1) return '1 day left';
        return `${days} days left`;
    };

    const getUrgencyLevel = (deadline: string) => {
        const days = getDaysLeft(deadline);
        if (days < 0) return 'critical';
        if (days <= 1) return 'high';
        if (days <= 3) return 'medium';
        return 'low';
    };

    const urgency = getUrgencyLevel(task.deadline!);
    const countdown = getCountdown(task.deadline!);

    return (
        <div
            className={`deadline-card urgency-${urgency}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="urgency-bar" />

            <div className="deadline-card-layout">
                {/* Checkbox Column */}
                <div className="card-col-check">
                    <button className="custom-checkbox-elite" onClick={() => onToggle(task)}>
                        <span className="material-symbols-outlined">
                            {task.status === 'done' ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                    </button>
                </div>

                {/* Content Column */}
                <div className="card-col-content">
                    <div className="task-title-group">
                        <span className="task-title-text">{task.title}</span>
                        {task.description && (
                            <span className="task-description-text">{task.description}</span>
                        )}
                    </div>
                </div>

                {/* Meta Column */}
                <div className="card-col-meta">
                    <div className={`urgency-badge urgency-${urgency}`}>
                        {urgency.toUpperCase()} RISK
                    </div>
                </div>

                {/* Priority Column */}
                <div className="card-col-priority">
                    <div className={`priority-dot-indicator priority-${task.priority}`} />
                    <span className="priority-label">{task.priority}</span>
                </div>

                {/* Date/Countdown Column */}
                <div className="card-col-date">
                    <div className="deadline-info-group">
                        <span className="countdown-text">{countdown}</span>
                        <span className="date-text">
                            {new Date(task.deadline!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Actions Column */}
                <div className="card-col-actions">
                    <div className={`card-actions-group ${isHovered ? 'visible' : ''}`}>
                        <button
                            className="btn-icon-xs"
                            title="Reschedule (Tomorrow)"
                            onClick={() => {
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                onUpdate(task.id, { deadline: tomorrow.toISOString() });
                            }}
                        >
                            <span className="material-symbols-outlined icon-xs">event</span>
                        </button>
                        <button className="btn-icon-xs delete" onClick={() => onDelete(task.id)} title="Delete">
                            <span className="material-symbols-outlined icon-xs">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});
