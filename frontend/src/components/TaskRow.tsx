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

/**
 * Splits text into segments: normal text and linked text.
 * Linked words render as underlined clickable spans.
 */
function renderLinkedText(
    text: string,
    links: { id: string; text: string; url: string }[],
    onLinkClick: (url: string, title: string) => void
) {
    if (!links || links.length === 0) return <>{text}</>;

    // Build a list of segments
    type Segment = { type: 'text'; content: string } | { type: 'link'; content: string; url: string; id: string };
    const segments: Segment[] = [];
    let remaining = text;

    while (remaining.length > 0) {
        // Find the earliest link match in remaining text
        let earliestIdx = remaining.length;
        let matchedLink: typeof links[0] | null = null;

        for (const link of links) {
            const idx = remaining.indexOf(link.text);
            if (idx !== -1 && idx < earliestIdx) {
                earliestIdx = idx;
                matchedLink = link;
            }
        }

        if (matchedLink && earliestIdx < remaining.length) {
            // Add text before the link
            if (earliestIdx > 0) {
                segments.push({ type: 'text', content: remaining.substring(0, earliestIdx) });
            }
            // Add the linked segment
            segments.push({ type: 'link', content: matchedLink.text, url: matchedLink.url, id: matchedLink.id });
            remaining = remaining.substring(earliestIdx + matchedLink.text.length);
        } else {
            // No more links found
            segments.push({ type: 'text', content: remaining });
            break;
        }
    }

    return (
        <>
            {segments.map((seg, i) =>
                seg.type === 'link' ? (
                    <span
                        key={`${seg.id}-${i}`}
                        onClick={e => { e.stopPropagation(); onLinkClick(seg.url, seg.content); }}
                        style={{
                            textDecoration: 'underline',
                            textDecorationColor: 'var(--primary)',
                            textUnderlineOffset: '3px',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontWeight: 500,
                        }}
                        title={`🔗 ${seg.url}`}
                    >
                        {seg.content}
                    </span>
                ) : (
                    <span key={i}>{seg.content}</span>
                )
            )}
        </>
    );
}

export const TaskRow = memo(({ task, onToggle, onEdit, onDelete }: TaskRowProps) => {
    const isDone = task.status === 'done';
    const deadlineDate = task.deadline ? new Date(task.deadline) : null;
    const isOverdue = deadlineDate && deadlineDate < new Date() && !isDone;
    const [confirmLink, setConfirmLink] = useState<{ url: string; title: string } | null>(null);

    const pc = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
    const links = (task.externalLinks || []) as { id: string; text: string; url: string }[];

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

    return (
        <>
            <div 
                className={`elite-row ${isDone ? 'elite-row--done' : ''}`}
                style={{ '--accent-color': pc.color, borderLeftColor: pc.color } as React.CSSProperties}
            >
                {/* Checkbox */}
                <button
                    className={`elite-row__checkbox ${isDone ? 'elite-row__checkbox--checked' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onToggle(task); }}
                    aria-checked={isDone} role="checkbox"
                    aria-label={`Mark ${task.title} as ${isDone ? 'incomplete' : 'complete'}`}
                    style={{ '--accent-color': pc.color } as React.CSSProperties}
                >
                    <span className="material-symbols-outlined elite-row__check-icon">check</span>
                </button>

                {/* Content Body */}
                <div className="elite-row__body" onClick={() => onEdit?.(task)}>
                    <div className="elite-row__main">
                        <span className="elite-row__title">
                            {renderLinkedText(task.title, links, handleLinkClick)}
                        </span>
                        {task.description && (
                            <p className="elite-row__desc">
                                {renderLinkedText(task.description, links, handleLinkClick)}
                            </p>
                        )}
                    </div>

                    {/* Meta Tags */}
                    <div className="elite-row__meta">
                        {deadlineDate && (
                            <span className={`elite-tag ${isOverdue ? 'elite-tag--overdue' : ''}`}>
                                <span className="material-symbols-outlined">schedule</span>
                                {formatDate(deadlineDate)}
                            </span>
                        )}
                        {task.energyLevel && (
                            <span className={`elite-tag elite-tag--energy-${task.energyLevel}`}>
                                <span className="material-symbols-outlined">bolt</span>
                                {task.energyLevel}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Bar */}
                <div className="elite-row__actions">
                    <button className="elite-row__action-btn" title="Edit"
                        onClick={(e) => { e.stopPropagation(); onEdit?.(task); }}>
                        <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button className="elite-row__action-btn elite-row__action-btn--delete" title="Delete"
                        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}>
                        <span className="material-symbols-outlined">delete_outline</span>
                    </button>
                </div>
            </div>

            {/* External Link Confirmation Dialog */}
            {confirmLink && (
                <div
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
                    }}
                    onClick={() => setConfirmLink(null)}
                >
                    <div onClick={e => e.stopPropagation()} style={{
                        background: 'var(--bg-primary)', borderRadius: 16,
                        padding: '28px 32px', maxWidth: 420, width: '90%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid var(--border)',
                    }}>
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
                            <button onClick={() => setConfirmLink(null)} style={{
                                padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)',
                                background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                            }}>Cancel</button>
                            <button onClick={confirmNavigation} style={{
                                padding: '8px 20px', borderRadius: 8, border: 'none',
                                background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                            }}>Open Link</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});