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
    text: string;
    url: string;
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
    const [externalLinks, setExternalLinks] = useState<ExternalLink[]>(
        (task.externalLinks || []) as ExternalLink[]
    );

    // Link popup state
    const [pendingLinkWord, setPendingLinkWord] = useState<string | null>(null);
    const [pendingLinkUrl, setPendingLinkUrl] = useState('');

    const { updateTask } = useAppStore();
    const titleRef = useRef<HTMLTextAreaElement>(null);
    const linkUrlRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.focus();
            const len = titleRef.current.value.length;
            titleRef.current.setSelectionRange(len, len);
        }
    }, []);

    useEffect(() => {
        if (pendingLinkWord && linkUrlRef.current) {
            linkUrlRef.current.focus();
        }
    }, [pendingLinkWord]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        const linkIndex = val.indexOf('#link');
        if (linkIndex !== -1) {
            const beforeLink = val.substring(0, linkIndex);
            const afterLink = val.substring(linkIndex + 5);
            const lastSpaceIdx = beforeLink.lastIndexOf(' ');
            const linkedWord = beforeLink.substring(lastSpaceIdx + 1);
            if (linkedWord.trim()) {
                setPendingLinkWord(linkedWord);
                setTitle(beforeLink + afterLink);
            } else {
                setTitle(beforeLink + afterLink);
            }
        } else {
            setTitle(val);
        }
    };

    const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        const linkIndex = val.indexOf('#link');
        if (linkIndex !== -1) {
            const beforeLink = val.substring(0, linkIndex);
            const afterLink = val.substring(linkIndex + 5);
            const lastSpaceIdx = beforeLink.lastIndexOf(' ');
            const linkedWord = beforeLink.substring(lastSpaceIdx + 1);
            if (linkedWord.trim()) {
                setPendingLinkWord(linkedWord);
                setDescription(beforeLink + afterLink);
            } else {
                setDescription(beforeLink + afterLink);
            }
        } else {
            setDescription(val);
        }
    };

    const confirmLink = () => {
        if (!pendingLinkWord || !pendingLinkUrl.trim()) return;
        const url = pendingLinkUrl.trim().startsWith('http') ? pendingLinkUrl.trim() : `https://${pendingLinkUrl.trim()}`;
        setExternalLinks(prev => [...prev, {
            id: `link-${Date.now()}`,
            text: pendingLinkWord,
            url,
        }]);
        setPendingLinkWord(null);
        setPendingLinkUrl('');
    };

    const removeLink = (id: string) => {
        setExternalLinks(prev => prev.filter(l => l.id !== id));
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
        if (e.key === 'Enter' && !e.shiftKey && !pendingLinkWord) { e.preventDefault(); handleSave(); }
        if (e.key === 'Escape') { if (pendingLinkWord) { setPendingLinkWord(null); setPendingLinkUrl(''); } else onClose(); }
    };

    const activePriority = PRIORITY_OPTIONS.find(p => p.id === priority)!;

    const renderPreview = (text: string) => {
        if (externalLinks.length === 0) return null;
        const linkedWords = externalLinks.filter(l => text.includes(l.text));
        if (linkedWords.length === 0) return null;
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4, padding: '0 16px' }}>
                {linkedWords.map(l => (
                    <span key={l.id} style={{
                        fontSize: 11, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 3,
                        padding: '2px 8px', borderRadius: 4, background: 'var(--primary-light)',
                    }}>
                        🔗 {l.text}
                        <button onClick={() => removeLink(l.id)} style={{
                            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)',
                            padding: 0, fontSize: 11, marginLeft: 2,
                        }}>✕</button>
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="itc-panel" style={{ border: '1px solid var(--primary)', margin: '4px 0', borderRadius: '12px' }}>
            <textarea
                ref={titleRef}
                className="itc-title"
                placeholder="Task name — type word#link to hyperlink"
                value={title}
                onChange={handleTitleChange}
                onKeyDown={handleKeyDown}
                rows={1}
            />
            {renderPreview(title)}

            <textarea
                className="itc-desc"
                placeholder="Add description… (word#link works here too)"
                value={description}
                onChange={handleDescChange}
                rows={2}
            />
            {renderPreview(description)}

            {/* Link URL Popup */}
            {pendingLinkWord && (
                <div style={{
                    padding: '12px 16px', borderTop: '1px solid var(--border)',
                    background: 'var(--surface-raised, var(--bg-secondary))',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>link</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        Link <strong style={{ color: 'var(--text-primary)' }}>"{pendingLinkWord}"</strong> to:
                    </span>
                    <input
                        ref={linkUrlRef}
                        type="url"
                        placeholder="https://example.com"
                        value={pendingLinkUrl}
                        onChange={e => setPendingLinkUrl(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmLink(); } if (e.key === 'Escape') { setPendingLinkWord(null); setPendingLinkUrl(''); } }}
                        style={{
                            flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)',
                            background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13,
                        }}
                    />
                    <button
                        onClick={confirmLink}
                        disabled={!pendingLinkUrl.trim()}
                        style={{
                            padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                            background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 500,
                            opacity: pendingLinkUrl.trim() ? 1 : 0.5,
                        }}
                    >Add</button>
                    <button
                        onClick={() => { setPendingLinkWord(null); setPendingLinkUrl(''); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 14 }}
                    >✕</button>
                </div>
            )}

            <div className="itc-footer">
                <div className="itc-footer__left">
                    <DateTimePicker value={deadline || ''} onChange={val => setDeadline(val)} />
                    <Menu
                        trigger={
                            <button className="itc-chip" style={{ '--chip-color': activePriority.color } as React.CSSProperties}>
                                <span className="itc-chip__dot" style={{ background: activePriority.color, boxShadow: `0 0 6px ${activePriority.color}` }} />
                                {activePriority.label}
                            </button>
                        }
                        items={PRIORITY_OPTIONS.map(opt => ({
                            id: opt.id, label: opt.label, icon: 'fiber_manual_record',
                            onClick: () => setPriority(opt.id as 'low' | 'medium' | 'high' | 'critical'),
                        }))}
                    />
                </div>
                <div className="itc-footer__right">
                    <button className="itc-btn itc-btn--ghost" onClick={onClose}>Cancel</button>
                    <button className="itc-btn itc-btn--primary" disabled={!title.trim() || isSubmitting} onClick={handleSave}>
                        {isSubmitting ? <span className="itc-spinner" /> : <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>}
                        {isSubmitting ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
