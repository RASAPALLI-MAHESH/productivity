import { memo } from 'react';
import type { Task } from '../types';

interface TaskRowProps {
    task: Task;
    onToggle: (task: Task) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
}

export const TaskRow = memo(({ task, onToggle, onEdit, onDelete }: TaskRowProps) => {
    const isDone = task.status === 'done';
    const deadlineDate = task.deadline ? new Date(task.deadline) : null;
    const isOverdue = deadlineDate && deadlineDate < new Date() && !isDone;

    // Format date: "Oct 24" or "Today" or "Tom"
    const formatDate = (date: Date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className={`task-row ${isDone ? 'completed' : ''}`}>
            {/* Checkbox */}
            <div className="task-col-checkbox">
                <button
                    className={`custom-checkbox ${isDone ? 'checked' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle(task);
                    }}
                    aria-checked={isDone}
                    role="checkbox"
                    aria-label={`Mark ${task.title} as ${isDone ? 'incomplete' : 'complete'}`}
                >
                    {isDone && <span className="material-symbols-outlined icon-xs">check</span>}
                </button>
            </div>

            {/* Title */}
            <div className="task-col-title" onClick={() => onEdit(task)}>
                <span className="task-text">{task.title}</span>
                {task.description && <span className="material-symbols-outlined icon-xs task-desc-icon">description</span>}
            </div>

            {/* Meta */}
            <div className="task-col-meta">
                {/* Deadline */}
                {deadlineDate && (
                    <div className={`meta-tag ${isOverdue ? 'overdue' : ''}`}>
                        <span className="material-symbols-outlined icon-xs">event</span>
                        {formatDate(deadlineDate)}
                    </div>
                )}

                {/* Priority */}
                <div className={`badge badge-${task.priority} badge-sm`}>
                    {task.priority}
                </div>
            </div>

            {/* Actions */}
            <div className="task-col-actions">
                <button className="btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
                    <span className="material-symbols-outlined icon-sm">edit</span>
                </button>
                <button className="btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}>
                    <span className="material-symbols-outlined icon-sm">delete</span>
                </button>
            </div>
        </div>
    );
}); // End memo
