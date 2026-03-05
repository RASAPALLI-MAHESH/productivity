import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { DateTimePicker } from './DateTimePicker';
import { Menu } from './Menu';

interface InlineTaskCreateProps {
    autoOpen?: boolean;
    onClose?: () => void;
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

export function InlineTaskCreate({ autoOpen = false, onClose }: InlineTaskCreateProps) {
    const [isExpanded, setIsExpanded] = useState(autoOpen);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
    const [deadline, setDeadline] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLinkManager, setShowLinkManager] = useState(false);
    const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
    const [newLinkTitle, setNewLinkTitle] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');

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

    const handleCancel = () => {
        setIsExpanded(false);
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDeadline(null);
        setExternalLinks([]);
        setShowLinkManager(false);
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
                subtasks: [],
                externalLinks: externalLinks.length > 0 ? externalLinks : undefined,
            });
            setTitle('');
            setDescription('');
            setPriority('medium');
            setDeadline(null);
            setExternalLinks([]);
            setShowLinkManager(false);
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
                placeholder="Task name (type #link to add links)"
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

            {/* Link Manager */}
            {showLinkManager && (
                <div style={{
                    padding: '12px 16px',
                    borderTop: '1px solid var(--border)',
                    background: 'var(--surface-raised, var(--bg-secondary))',
                    borderRadius: '0 0 12px 12px',
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
