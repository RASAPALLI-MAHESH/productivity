import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { DateTimePicker } from './DateTimePicker';
import { Menu } from './Menu';
import type { Task } from '../types';

interface InlineTaskEditProps {
    task: Task;
    onClose: () => void;
}

interface ExternalLink {
    id: string;
    url: string;
    title: string;
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
    const [externalLinks, setExternalLinks] = useState<ExternalLink[]>(task.externalLinks || []);
    const [showLinkManager, setShowLinkManager] = useState((task.externalLinks?.length ?? 0) > 0);
    const [newLinkTitle, setNewLinkTitle] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');

    const { updateTask } = useAppStore();
    const titleRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.focus();
            const len = titleRef.current.value.length;
            titleRef.current.setSelectionRange(len, len);
        }
    }, []);

    // Watch for #link in the title
    useEffect(() => {
        if (title.includes('#link')) {
            setShowLinkManager(true);
            setTitle(prev => prev.replace(/#link/gi, '').trim());
        }
    }, [title]);

    const addLink = () => {
        if (!newLinkUrl.trim()) return;
        const link: ExternalLink = {
            id: `link-${Date.now()}`,
            url: newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`,
            title: newLinkTitle.trim() || new URL(newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`).hostname,
        };
        setExternalLinks([...externalLinks, link]);
        setNewLinkTitle('');
        setNewLinkUrl('');
    };

    const removeLink = (id: string) => {
        setExternalLinks(externalLinks.filter(l => l.id !== id));
    };

    const handleSave = async () => {
        if (!title.trim()) return;
        setIsSubmitting(true);
        try {
            await updateTask(task.id, {
                title: title.trim(),
                description: description.trim(),
                priority,
                deadline,
                externalLinks: externalLinks.length > 0 ? externalLinks : undefined,
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
                placeholder="Task name (type #link to add links)"
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

            {/* Link Manager */}
            {showLinkManager && (
                <div style={{
                    padding: '12px 16px',
                    borderTop: '1px solid var(--border)',
                    background: 'var(--surface-raised, var(--bg-secondary))',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>link</span>
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>External Links</span>
                        <button
                            onClick={() => { setShowLinkManager(false); setExternalLinks([]); }}
                            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 12 }}
                        >✕</button>
                    </div>

                    {/* Existing links */}
                    {externalLinks.map(link => (
                        <div key={link.id} style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                            background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 6,
                            border: '1px solid var(--border)',
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--primary)' }}>open_in_new</span>
                            <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{link.title}</strong> — {link.url}
                            </span>
                            <button
                                onClick={() => removeLink(link.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: 14, padding: 2 }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                            </button>
                        </div>
                    ))}

                    {/* Add new link */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8 }}>
                        <input
                            type="text"
                            placeholder="Link title"
                            value={newLinkTitle}
                            onChange={e => setNewLinkTitle(e.target.value)}
                            style={{
                                flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)',
                                background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13,
                            }}
                        />
                        <input
                            type="url"
                            placeholder="https://example.com"
                            value={newLinkUrl}
                            onChange={e => setNewLinkUrl(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLink())}
                            style={{
                                flex: 2, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)',
                                background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13,
                            }}
                        />
                        <button
                            onClick={addLink}
                            disabled={!newLinkUrl.trim()}
                            style={{
                                padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                                background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 500,
                                opacity: newLinkUrl.trim() ? 1 : 0.5,
                            }}
                        >Add</button>
                    </div>
                </div>
            )}

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

                    {/* Link toggle button */}
                    {!showLinkManager && (
                        <button
                            className="itc-chip"
                            onClick={() => setShowLinkManager(true)}
                            title="Add external links"
                            style={{ '--chip-color': '#6366f1' } as React.CSSProperties}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>link</span>
                            Links
                        </button>
                    )}
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
