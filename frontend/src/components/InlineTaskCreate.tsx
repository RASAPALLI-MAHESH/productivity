import { useState, useRef, useEffect, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { DateTimePicker } from './DateTimePicker';
import { Menu } from './Menu';
import { parseTask, hasParseableContent } from '../lib/taskParser';

interface InlineTaskCreateProps {
    autoOpen?: boolean;
    onClose?: () => void;
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

export function InlineTaskCreate({ autoOpen = false, onClose }: InlineTaskCreateProps) {
    const [isExpanded, setIsExpanded] = useState(autoOpen);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
    const [deadline, setDeadline] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
    const [rawInput, setRawInput] = useState(''); // Store raw input for natural language parsing

    // Link popup state
    const [pendingLinkWord, setPendingLinkWord] = useState<string | null>(null);
    const [pendingLinkUrl, setPendingLinkUrl] = useState('');

    const { createTask, fetchTasks } = useAppStore();
    const titleRef = useRef<HTMLTextAreaElement>(null);
    const linkUrlRef = useRef<HTMLInputElement>(null);

    // Parse input for smart suggestions
    const parsed = useMemo(() => {
        if (!rawInput) return null;
        return parseTask(rawInput);
    }, [rawInput]);

    const hasParsed = useMemo(() => hasParseableContent(rawInput), [rawInput]);

    useEffect(() => {
        if (autoOpen) setIsExpanded(true);
    }, [autoOpen]);

    useEffect(() => {
        if (isExpanded && titleRef.current) {
            titleRef.current.focus();
        }
    }, [isExpanded]);

    useEffect(() => {
        if (pendingLinkWord && linkUrlRef.current) {
            linkUrlRef.current.focus();
        }
    }, [pendingLinkWord]);

    // Detect #link in title and smart parse
    const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setRawInput(val); // Store raw input for parsing
        
        const linkIndex = val.indexOf('#link');
        if (linkIndex !== -1) {
            // Find the word/text before #link
            const beforeLink = val.substring(0, linkIndex);
            const afterLink = val.substring(linkIndex + 5); // skip '#link'
            // Find the last word before #link (from last space to #link)
            const lastSpaceIdx = beforeLink.lastIndexOf(' ');
            const linkedWord = beforeLink.substring(lastSpaceIdx + 1);
            if (linkedWord.trim()) {
                setPendingLinkWord(linkedWord);
                setTitle(beforeLink + afterLink);
                setRawInput(beforeLink + afterLink);
            } else {
                setTitle(beforeLink + afterLink);
                setRawInput(beforeLink + afterLink);
            }
        } else {
            setTitle(val);
        }
    };

    // Apply parsed values to form fields
    const applyParsedValues = () => {
        if (!parsed) return;
        
        // Set the clean title
        if (parsed.title) {
            setTitle(parsed.title);
        }
        
        // Set priority from parsed value
        if (parsed.priority) {
            const priorityMap: Record<number, 'low' | 'medium' | 'high' | 'critical'> = {
                1: 'critical',
                2: 'high',
                3: 'medium',
                4: 'low',
            };
            setPriority(priorityMap[parsed.priority] || 'medium');
        }
        
        // Set deadline from parsed date/time
        if (parsed.dueDate) {
            let deadlineStr = parsed.dueDate;
            if (parsed.dueTime) {
                deadlineStr += `T${parsed.dueTime}:00`;
            }
            setDeadline(deadlineStr);
        }
        
        // Clear raw input after applying
        setRawInput('');
    };

    // Detect #link in description
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

    const handleCancel = () => {
        setIsExpanded(false);
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDeadline(null);
        setExternalLinks([]);
        setPendingLinkWord(null);
        setPendingLinkUrl('');
        setRawInput('');
        onClose?.();
    };

    const handleCreate = async () => {
        // Use parsed title if available, otherwise raw title
        const finalTitle = (parsed?.title || title).trim();
        if (!finalTitle) return;
        
        // Determine final priority (parsed takes precedence if set)
        let finalPriority = priority;
        if (parsed?.priority) {
            const priorityMap: Record<number, 'low' | 'medium' | 'high' | 'critical'> = {
                1: 'critical',
                2: 'high',
                3: 'medium',
                4: 'low',
            };
            finalPriority = priorityMap[parsed.priority] || priority;
        }
        
        // Determine final deadline (parsed takes precedence if set)
        let finalDeadline = deadline;
        if (parsed?.dueDate) {
            finalDeadline = parsed.dueDate;
            if (parsed.dueTime) {
                finalDeadline += `T${parsed.dueTime}:00`;
            }
        }
        
        setIsSubmitting(true);
        try {
            await createTask({
                title: finalTitle,
                description: description.trim(),
                priority: finalPriority,
                deadline: finalDeadline,
                status: 'todo',
                subtasks: [],
                externalLinks: externalLinks.length > 0 ? externalLinks : undefined,
            });
            setTitle('');
            setDescription('');
            setPriority('medium');
            setDeadline(null);
            setExternalLinks([]);
            setRawInput('');
            setIsExpanded(false);
            onClose?.();
            // Force refresh task list to clear empty state
            fetchTasks({ page: 0, size: 20, sortBy: 'createdAt', sortDirection: 'desc' });
        } catch (err) {
            console.error('Failed to create task:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !pendingLinkWord) { e.preventDefault(); handleCreate(); }
        if (e.key === 'Escape') { if (pendingLinkWord) { setPendingLinkWord(null); setPendingLinkUrl(''); } else handleCancel(); }
    };

    const activePriority = PRIORITY_OPTIONS.find(p => p.id === priority)!;

    // Render text with linked words highlighted
    const renderPreview = (text: string) => {
        if (externalLinks.length === 0) return null;
        const linkedWords = externalLinks.filter(l =>
            text.includes(l.text)
        );
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
                placeholder="Try: 'Design meeting tomorrow 3pm p1' or type word#link"
                value={title}
                onChange={handleTitleChange}
                onKeyDown={handleKeyDown}
                rows={1}
            />
            
            {/* Smart Parse Preview */}
            {hasParsed && parsed && (
                <div className="itc-smart-preview">
                    <div className="itc-smart-preview__header">
                        <span className="material-symbols-outlined">auto_awesome</span>
                        <span>Smart detected:</span>
                    </div>
                    <div className="itc-smart-preview__tags">
                        {parsed.title && (
                            <span className="itc-smart-tag itc-smart-tag--title">
                                "{parsed.title}"
                            </span>
                        )}
                        {parsed.dueDate && (
                            <span className="itc-smart-tag itc-smart-tag--date">
                                <span className="material-symbols-outlined">event</span>
                                {parsed.dueDate}{parsed.dueTime && ` ${parsed.dueTime}`}
                            </span>
                        )}
                        {parsed.priority && (
                            <span className={`itc-smart-tag itc-smart-tag--p${parsed.priority}`}>
                                <span className="material-symbols-outlined">flag</span>
                                P{parsed.priority}
                            </span>
                        )}
                        {parsed.recurring && (
                            <span className="itc-smart-tag itc-smart-tag--recurring">
                                <span className="material-symbols-outlined">repeat</span>
                                {parsed.recurring}
                            </span>
                        )}
                    </div>
                </div>
            )}
            
            {renderPreview(title)}

            {/* Description input */}
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

            {/* Footer toolbar */}
            <div className="itc-footer">
                <div className="itc-footer__left">
                    <DateTimePicker
                        value={deadline || ''}
                        onChange={val => setDeadline(val)}
                    />
                    <Menu
                        trigger={
                            <button className="itc-chip" style={{ '--chip-color': activePriority.color } as React.CSSProperties}>
                                <span className="itc-chip__dot" style={{ background: activePriority.color, boxShadow: `0 0 6px ${activePriority.color}` }} />
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
                    <button className="itc-btn itc-btn--ghost" onClick={handleCancel}>Cancel</button>
                    <button
                        className="itc-btn itc-btn--primary"
                        disabled={!title.trim() || isSubmitting}
                        onClick={handleCreate}
                    >
                        {isSubmitting ? <span className="itc-spinner" /> : <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>}
                        {isSubmitting ? 'Adding…' : 'Add task'}
                    </button>
                </div>
            </div>
        </div>
    );
}
