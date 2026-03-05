import { memo, useState } from 'react';
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
    const [confirmLink, setConfirmLink] = useState<{ url: string; title: string } | null>(null);

    const pc = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;

    const formatDate = (date: Date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleLinkClick = (url: string, title: string) => {
        setConfirmLink({ url, title });
    };

    const confirmNavigation = () => {
        if (confirmLink) {
            window.open(confirmLink.url, '_blank', 'noopener,noreferrer');
            setConfirmLink(null);
        }
    };

    const hasLinks = task.externalLinks && task.externalLinks.length > 0;

    return (
        <>
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
                <div className="elite-row__body">
                    <div className="elite-row__main">
                        <span className={`elite-row__title ${hasLinks ? 'elite-row__title--linked' : ''}`}>{task.title}</span>
                        {task.description && (
                            <p className="elite-row__desc">{task.description}</p>
                        )}
                        {/* External link chips */}
                        {hasLinks && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                                {task.externalLinks!.map(link => (
                                    <button
                                        key={link.id}
                                        onClick={(e) => { e.stopPropagation(); handleLinkClick(link.url, link.title); }}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                            padding: '3px 10px', borderRadius: 6,
                                            border: '1px solid var(--primary)',
                                            background: 'transparent',
                                            color: 'var(--primary)', fontSize: 12, fontWeight: 500,
                                            cursor: 'pointer', textDecoration: 'underline',
                                            transition: 'background 0.15s, color 0.15s',
                                        }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)'; }}
                                        title={link.url}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>open_in_new</span>
                                        {link.title}
                                    </button>
                                ))}
                            </div>
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

            {/* Confirmation Dialog Overlay */}
            {confirmLink && (
                <div
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
                    }}
                    onClick={() => setConfirmLink(null)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-primary)', borderRadius: 16,
                            padding: '28px 32px', maxWidth: 420, width: '90%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid var(--border)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--primary)' }}>open_in_new</span>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Open External Link</h3>
                        </div>
                        <p style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            You are about to navigate to an external website:
                        </p>
                        <p style={{
                            padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8,
                            fontSize: 13, wordBreak: 'break-all', color: 'var(--primary)', fontFamily: 'monospace',
                            border: '1px solid var(--border)', margin: '0 0 20px',
                        }}>
                            {confirmLink.url}
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setConfirmLink(null)}
                                style={{
                                    padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)',
                                    background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
                                    fontSize: 14, fontWeight: 500,
                                }}
                            >Cancel</button>
                            <button
                                onClick={confirmNavigation}
                                style={{
                                    padding: '8px 20px', borderRadius: 8, border: 'none',
                                    background: 'var(--primary)', color: '#fff', cursor: 'pointer',
                                    fontSize: 14, fontWeight: 600,
                                }}
                            >Open Link</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});