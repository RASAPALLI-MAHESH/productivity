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

    // Subtask progress
    const totalSubtasks = task.subtasks?.length || 0;
    const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
    const hasSubtasks = totalSubtasks > 0;

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
        <div className={`task-row ${isDone ? 'completed' : ''} priority-${task.priority}`}>
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
                    <span className="material-symbols-outlined check-icon">check</span>
                </button>
            </div>

            {/* Content Section */}
            <div className="task-col-main" onClick={() => onEdit(task)}>
                <div className="task-title-row">
                    <span className="task-text">{task.title}</span>
                </div>
                {task.description && (
                    <div className="task-desc-preview">
                        {task.description}
                    </div>
                )}

                {/* Meta Row (Internal) */}
                <div className="task-meta-inline">
                    {/* Deadline */}
                    {deadlineDate && (
                        <div className={`meta-item ${isOverdue ? 'overdue' : ''}`}>
                            <span className="material-symbols-outlined icon-xs">event</span>
                            <span>{formatDate(deadlineDate)}</span>
                        </div>
                    )}

                    {/* Subtasks Progress */}
                    {hasSubtasks && (
                        <div className="meta-item subtasks-badge">
                            <span className="material-symbols-outlined icon-xs">account_tree</span>
                            <span>{completedSubtasks}/{totalSubtasks}</span>
                        </div>
                    )}

                    {/* Energy Level */}
                    {task.energyLevel && (
                        <div className={`meta-item energy-${task.energyLevel}`}>
                            <span className="material-symbols-outlined icon-xs">
                                {task.energyLevel === 'low' ? 'battery_low' : task.energyLevel === 'medium' ? 'battery_50' : 'battery_full'}
                            </span>
                            <span>{task.energyLevel}</span>
                        </div>
                    )}

                    {/* Estimate */}
                    {task.estimatedMinutes && (
                        <div className="meta-item estimate-tag">
                            <span className="material-symbols-outlined icon-xs">schedule</span>
                            <span>{task.estimatedMinutes}m</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Meta (Visible Actions & Priority) */}
            <div className="task-col-right">
                <div className={`priority-indicator priority-${task.priority}`}>
                    <span className="priority-dot"></span>
                    <span className="priority-label">{task.priority}</span>
                </div>

                <div className="task-actions-hover">
                    <button className="btn-icon-xs" title="Edit Task" onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
                        <span className="material-symbols-outlined icon-sm">edit_note</span>
                    </button>
                    <button className="btn-icon-xs delete-hover" title="Delete Task" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}>
                        <span className="material-symbols-outlined icon-sm">delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
}); // End memo
