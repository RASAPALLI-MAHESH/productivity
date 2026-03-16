import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import type { Task } from '../types';
import { TaskRow } from '../components/TaskRow';
import { Select } from '../components/Select';
import { InlineTaskCreate } from '../components/InlineTaskCreate';
import { InlineTaskEdit } from '../components/InlineTaskEdit';
import { UndoToast } from '../components/UndoToast';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Outlet context from Layout.tsx
interface LayoutContext {
    showMobileCreate: boolean;
    setShowMobileCreate: (val: boolean) => void;
}

function getQuickDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return {
        today: today.toISOString().split('T')[0],
        tomorrow: tomorrow.toISOString().split('T')[0],
        nextWeek: nextWeek.toISOString().split('T')[0],
    };
}

export function Tasks() {
    const { tasks, setTasks, taskLoading, totalPages, fetchTasks, updateTask, deleteTask, createTask } = useAppStore();
    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Mobile task sheet state
    const [mobileTaskTitle, setMobileTaskTitle] = useState('');
    const [mobileTaskPriority, setMobileTaskPriority] = useState('medium');
    const [mobileTaskDeadline, setMobileTaskDeadline] = useState('');
    const [mobileTaskDesc, setMobileTaskDesc] = useState('');
    const [isMobileCreating, setIsMobileCreating] = useState(false);
    const [showDescField, setShowDescField] = useState(false);

    // Get showMobileCreate from Layout outlet context (with fallback for safety)
    const ctx = useOutletContext<LayoutContext | null>();
    const showMobileCreate = ctx?.showMobileCreate ?? false;
    const setShowMobileCreate = ctx?.setShowMobileCreate ?? (() => {});


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchTasks({
            page,
            size: 20,
            sortBy: 'createdAt',
            sortDirection: 'desc',
        });
    }, [fetchTasks, page]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            if (
                e.key === 'a' &&
                document.activeElement?.tagName !== 'INPUT' &&
                document.activeElement?.tagName !== 'TEXTAREA'
            ) {
                e.preventDefault();
                setIsAddingTask(true);
            }
            if (
                (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') ||
                (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))
            ) {
                e.preventDefault();
                (document.querySelector('.search-input--elite') as HTMLInputElement)?.focus();
            }
            if (e.key === 'Escape' && showMobileCreate) {
                setShowMobileCreate(false);
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [showMobileCreate, setShowMobileCreate]);

    // Debounce search
    useEffect(() => {
        if (searchQuery) {
            setIsSearching(true);
            const t = setTimeout(() => {
                setDebouncedSearch(searchQuery);
                setIsSearching(false);
            }, 400);
            return () => clearTimeout(t);
        } else {
            setDebouncedSearch('');
            setIsSearching(false);
        }
    }, [searchQuery]);

    // Reset mobile sheet when it closes
    useEffect(() => {
        if (!showMobileCreate) {
            setMobileTaskTitle('');
            setMobileTaskPriority('medium');
            setMobileTaskDeadline('');
            setMobileTaskDesc('');
            setShowDescField(false);
        }
    }, [showMobileCreate]);

    const filteredTasks = tasks.filter(task => {
        if (filterPriority && task.priority !== filterPriority) return false;
        if (!debouncedSearch) return true;
        const q = debouncedSearch.toLowerCase();
        return (
            task.title.toLowerCase().includes(q) ||
            (task.description && task.description.toLowerCase().includes(q))
        );
    });

    const handleStatusToggle = useCallback(async (task: Task) => {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        await updateTask(task.id, { ...task, status: newStatus });
    }, [updateTask]);

    const handleDelete = useCallback(async (id: string) => {
        await deleteTask(id);
    }, [deleteTask]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = tasks.findIndex(t => t.id === active.id);
            const newIndex = tasks.findIndex(t => t.id === over.id);
            setTasks(arrayMove(tasks, oldIndex, newIndex));
        }
    };

    const handleMobileCreate = async () => {
        if (!mobileTaskTitle.trim()) return;
        setIsMobileCreating(true);
        try {
            await createTask({
                title: mobileTaskTitle.trim(),
                priority: mobileTaskPriority as Task['priority'],
                status: 'todo',
                deadline: mobileTaskDeadline || null,
                description: mobileTaskDesc.trim() || undefined,
            });
            setShowMobileCreate(false);
            fetchTasks({ page: 0, size: 20, sortBy: 'createdAt', sortDirection: 'desc' });
        } finally {
            setIsMobileCreating(false);
        }
    };

    const completedCount = tasks.filter(t => t.status === 'done').length;

    const PRIORITY_OPTS = [
        { value: 'low', label: 'Low', color: '#10b981' },
        { value: 'medium', label: 'Medium', color: '#f59e0b' },
        { value: 'high', label: 'High', color: '#ef4444' },
        { value: 'critical', label: 'Critical', color: '#8b5cf6' },
    ];

    const { user } = useAuthStore();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const displayName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || '';

    const quickDates = getQuickDates();

    const formatQuickDate = (dateStr: string) => {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        if (dateStr === today) return 'Today';
        if (dateStr === tomorrowStr) return 'Tomorrow';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="tasks-page">

            {/* ── Page Header ── */}
            <header className="page-header--elite">
                <div className="page-title-group">
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                        <h1 className="page-title" style={{ margin: 0 }}>Tasks</h1>
                        <span className="page-greeting" style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            {getGreeting()}, {displayName}
                        </span>
                    </div>
                    {tasks.length > 0 && (
                        <p className="page-subtitle--elite">
                            {completedCount} of {tasks.length} tasks completed
                        </p>
                    )}
                </div>
            </header>

            {/* ── Command Bar (Search & Filter) ── */}
            <div className="command-bar--elite">
                <div className="search-group--elite">
                    <span className="material-symbols-outlined search-icon--elite">
                        {isSearching ? 'sync' : 'search'}
                    </span>
                    <input
                        type="text"
                        className="search-input--elite"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <kbd className="kbd-hint desktop-only">⌘ K</kbd>
                </div>

                <div className="filter-group--elite">
                    <Select
                        label="Priority"
                        value={filterPriority}
                        onChange={val => { setFilterPriority(val); setPage(0); }}
                        options={[
                            { value: '', label: 'All Priority' },
                            { value: 'low', label: 'Low' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'high', label: 'High' },
                            { value: 'critical', label: 'Critical' },
                        ]}
                    />
                </div>
            </div>

            {/* ── Body ── */}
            <div className="tasks-content--elite">

                {/* Inline creation — Desktop only */}
                <div className="inline-create-container--elite desktop-only">
                    <InlineTaskCreate
                        autoOpen={isAddingTask}
                        onClose={() => setIsAddingTask(false)}
                    />
                </div>

                {/* Task list */}
                {taskLoading ? (
                    <div className="task-list-v2" style={{ marginTop: 4 }}>
                        {[...Array(5)].map((_, i) => <div key={i} className="elite-row skeleton" style={{ height: 60 }} />)}
                    </div>
                ) : filteredTasks.length > 0 ? (
                    <>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={filteredTasks.map(t => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="task-list--elite">
                                    {filteredTasks.map(task => (
                                        editingTaskId === task.id ? (
                                            <InlineTaskEdit
                                                key={`edit-${task.id}`}
                                                task={task}
                                                onClose={() => setEditingTaskId(null)}
                                            />
                                        ) : (
                                            <TaskRow
                                                key={task.id}
                                                task={task}
                                                onToggle={handleStatusToggle}
                                                onDelete={handleDelete}
                                                onEdit={(t) => setEditingTaskId(t.id)}
                                            />
                                        )
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination--elite">
                                <button className="pagination-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                                    <span className="material-symbols-outlined icon-sm">chevron_left</span>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button key={i} className={`pagination-btn ${page === i ? 'active' : ''}`} onClick={() => setPage(i)}>
                                        {i + 1}
                                    </button>
                                ))}
                                <button className="pagination-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                                    <span className="material-symbols-outlined icon-sm">chevron_right</span>
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state--elite">
                        <div className="empty-icon">
                            <span className="material-symbols-outlined">
                                {searchQuery ? 'search_off' : 'edit_note'}
                            </span>
                        </div>
                        <h3>{searchQuery ? `No results for "${searchQuery}"` : 'No tasks yet'}</h3>
                        <p>{searchQuery ? 'Try a different search term.' : 'Tap + to add your first task.'}</p>
                    </div>
                )}
            </div>

            {/* ── Mobile Task Creation Bottom Sheet ── */}
            {showMobileCreate && (
                <div className="mobile-sheet-backdrop" onClick={() => setShowMobileCreate(false)}>
                    <div className="mobile-task-sheet todoist-sheet" onClick={e => e.stopPropagation()}>
                        <div className="mobile-sheet-handle" />

                        {/* Title row */}
                        <div className="mts-title-row">
                            <button
                                className="mts-check-btn"
                                aria-label="Priority indicator"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--border-hover)' }}>radio_button_unchecked</span>
                            </button>
                            <input
                                className="mts-title-input"
                                type="text"
                                placeholder="Task name"
                                value={mobileTaskTitle}
                                onChange={e => setMobileTaskTitle(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleMobileCreate(); if (e.key === 'Escape') setShowMobileCreate(false); }}
                                autoFocus
                            />
                        </div>

                        {/* Description field (collapsible) */}
                        {showDescField ? (
                            <textarea
                                className="mts-desc-input"
                                placeholder="Description"
                                value={mobileTaskDesc}
                                onChange={e => setMobileTaskDesc(e.target.value)}
                                rows={2}
                                autoFocus
                            />
                        ) : (
                            <button
                                className="mts-add-desc-btn"
                                onClick={() => setShowDescField(true)}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>notes</span>
                                Add description
                            </button>
                        )}

                        {/* Scheduling row — quick chips */}
                        <div className="mts-schedule-row">
                            <button
                                className={`mts-chip mts-chip--date ${mobileTaskDeadline === quickDates.today ? 'active green' : ''}`}
                                onClick={() => setMobileTaskDeadline(mobileTaskDeadline === quickDates.today ? '' : quickDates.today)}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>today</span>
                                Today
                            </button>
                            <button
                                className={`mts-chip mts-chip--date ${mobileTaskDeadline === quickDates.tomorrow ? 'active amber' : ''}`}
                                onClick={() => setMobileTaskDeadline(mobileTaskDeadline === quickDates.tomorrow ? '' : quickDates.tomorrow)}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>wb_sunny</span>
                                Tomorrow
                            </button>
                            <button
                                className={`mts-chip mts-chip--date ${mobileTaskDeadline === quickDates.nextWeek ? 'active blue' : ''}`}
                                onClick={() => setMobileTaskDeadline(mobileTaskDeadline === quickDates.nextWeek ? '' : quickDates.nextWeek)}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>view_week</span>
                                Next week
                            </button>

                            {/* Custom date picker */}
                            <label className={`mts-chip mts-chip--date ${mobileTaskDeadline && ![quickDates.today, quickDates.tomorrow, quickDates.nextWeek].includes(mobileTaskDeadline) ? 'active blue' : ''}`}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_month</span>
                                {mobileTaskDeadline && ![quickDates.today, quickDates.tomorrow, quickDates.nextWeek].includes(mobileTaskDeadline)
                                    ? formatQuickDate(mobileTaskDeadline)
                                    : 'Pick date'}
                                <input
                                    type="date"
                                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                                    value={mobileTaskDeadline}
                                    onChange={e => setMobileTaskDeadline(e.target.value)}
                                />
                            </label>
                        </div>

                        {/* Priority row */}
                        <div className="mts-priority-row">
                            <span className="mts-section-label">Priority</span>
                            <div className="mts-priority-chips">
                                {PRIORITY_OPTS.map(opt => (
                                    <button
                                        key={opt.value}
                                        className={`mts-chip mts-chip--priority ${mobileTaskPriority === opt.value ? 'active' : ''}`}
                                        style={{ '--chip-color': opt.color } as React.CSSProperties}
                                        onClick={() => setMobileTaskPriority(opt.value)}
                                    >
                                        <span className="mts-priority-dot" style={{ background: opt.color }} />
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Active deadline display */}
                        {mobileTaskDeadline && (
                            <div className="mts-deadline-banner">
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>event</span>
                                <span>{formatQuickDate(mobileTaskDeadline)}</span>
                                <button
                                    className="mts-deadline-clear"
                                    onClick={() => setMobileTaskDeadline('')}
                                    aria-label="Clear date"
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                                </button>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mobile-sheet-actions">
                            <button className="mobile-sheet-cancel" onClick={() => setShowMobileCreate(false)}>
                                Cancel
                            </button>
                            <button
                                className="mobile-sheet-submit"
                                onClick={handleMobileCreate}
                                disabled={!mobileTaskTitle.trim() || isMobileCreating}
                            >
                                {isMobileCreating ? 'Adding…' : 'Add Task'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <UndoToast />
        </div>
    );
}
