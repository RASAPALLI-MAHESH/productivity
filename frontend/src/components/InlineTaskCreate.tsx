import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { DateTimePicker } from './DateTimePicker';
import { Menu } from './Menu';

interface InlineTaskCreateProps {
    autoOpen?: boolean;
    onClose?: () => void;
}

const PRIORITY_OPTIONS = [
    { id: 'low', label: 'Low', color: '#10b981' },
    { id: 'medium', label: 'Medium', color: '#f59e0b' },
    { id: 'high', label: 'High', color: '#ef4444' },
    { id: 'critical', label: 'Critical', color: '#8b5cf6' },
] as const;

export function InlineTaskCreate({ autoOpen = false, onClose }: InlineTaskCreateProps) {
    const [isExpanded, setIsExpanded] = useState(autoOpen);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
    const [deadline, setDeadline] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { createTask } = useAppStore();
    const titleRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (autoOpen) setIsExpanded(true);
    }, [autoOpen]);

    useEffect(() => {
        if (isExpanded && titleRef.current) {
            titleRef.current.focus();
        }
    }, [isExpanded]);

    const handleCancel = () => {
        setIsExpanded(false);
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDeadline(null);
        onClose?.();
    };

    const handleCreate = async () => {
        if (!title.trim()) return;
        setIsSubmitting(true);
        try {
            await createTask({
                title: title.trim(),
                description: description.trim(),
                priority,
                deadline,
                status: 'todo',
                subtasks: []
            });
            setTitle('');
            setDescription('');
            setPriority('medium');
            setDeadline(null);
            setIsExpanded(false);
            onClose?.();
        } catch (err) {
            console.error('Failed to create task:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCreate(); }
        if (e.key === 'Escape') handleCancel();
    };

    const activePriority = PRIORITY_OPTIONS.find(p => p.id === priority)!;

    /* ── COLLAPSED ── */
    if (!isExpanded) {
        return (
            <button className="itc-trigger" onClick={() => setIsExpanded(true)}>
                <span className="itc-trigger__icon material-symbols-outlined">add</span>
                <span className="itc-trigger__label">Add task</span>
                <span className="itc-trigger__hint">A</span>
            </button>
        );
    }

    /* ── EXPANDED ── */
    return (
        <div className="itc-panel">
            {/* Title input */}
            <textarea
                ref={titleRef}
                className="itc-title"
                placeholder="Task name"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
            />

            {/* Description input */}
            <textarea
                className="itc-desc"
                placeholder="Add description…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
            />

            {/* Footer toolbar */}
            <div className="itc-footer">
                <div className="itc-footer__left">
                    {/* Date picker */}
                    <DateTimePicker
                        value={deadline || ''}
                        onChange={val => setDeadline(val)}
                    />

                    {/* Priority menu */}
                    <Menu
                        trigger={
                            <button className="itc-chip" style={{ '--chip-color': activePriority.color } as React.CSSProperties}>
                                <span
                                    className="itc-chip__dot"
                                    style={{ background: activePriority.color, boxShadow: `0 0 6px ${activePriority.color}` }}
                                />
                                {activePriority.label}
                            </button>
                        }
                        items={PRIORITY_OPTIONS.map(opt => ({
                            id: opt.id,
                            label: opt.label,
                            icon: 'fiber_manual_record',
                            onClick: () => setPriority(opt.id as 'low' | 'medium' | 'high' | 'critical'),
                        }))}
                    />
                </div>

                <div className="itc-footer__right">
                    <button className="itc-btn itc-btn--ghost" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button
                        className="itc-btn itc-btn--primary"
                        disabled={!title.trim() || isSubmitting}
                        onClick={handleCreate}
                    >
                        {isSubmitting
                            ? <span className="itc-spinner" />
                            : <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                        }
                        {isSubmitting ? 'Adding…' : 'Add task'}
                    </button>
                </div>
            </div>
        </div>
    );
}
