import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { DateTimePicker } from './DateTimePicker';
import { Menu } from './Menu';
import type { Task } from '../types';

interface InlineTaskEditProps {
    task: Task;
    onClose: () => void;
}

const PRIORITY_OPTIONS = [
    { id: 'low', label: 'Low', color: '#10b981' },
    { id: 'medium', label: 'Medium', color: '#f59e0b' },
    { id: 'high', label: 'High', color: '#ef4444' },
    { id: 'critical', label: 'Critical', color: '#8b5cf6' },
] as const;

export function InlineTaskEdit({ task, onClose }: InlineTaskEditProps) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>(task.priority);
    const [deadline, setDeadline] = useState<string | null>(task.deadline || null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { updateTask } = useAppStore();
    const titleRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.focus();
            // Move cursor to end of text
            const len = titleRef.current.value.length;
            titleRef.current.setSelectionRange(len, len);
        }
    }, []);

    const handleSave = async () => {
        if (!title.trim()) return;
        setIsSubmitting(true);
        try {
            await updateTask(task.id, {
                title: title.trim(),
                description: description.trim(),
                priority,
                deadline,
            });
            onClose();
        } catch (err) {
            console.error('Failed to update task:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); }
        if (e.key === 'Escape') onClose();
    };

    const activePriority = PRIORITY_OPTIONS.find(p => p.id === priority)!;

    return (
        <div className="itc-panel" style={{ border: '1px solid var(--primary)', margin: '4px 0', borderRadius: '12px' }}>
            <textarea
                ref={titleRef}
                className="itc-title"
                placeholder="Task name"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
            />

            <textarea
                className="itc-desc"
                placeholder="Add description…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
            />

            <div className="itc-footer">
                <div className="itc-footer__left">
                    <DateTimePicker
                        value={deadline || ''}
                        onChange={val => setDeadline(val)}
                    />

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
                    <button className="itc-btn itc-btn--ghost" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="itc-btn itc-btn--primary"
                        disabled={!title.trim() || isSubmitting}
                        onClick={handleSave}
                    >
                        {isSubmitting ? <span className="itc-spinner" /> : <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>}
                        {isSubmitting ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
