import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import type { Task } from '../types';
import { TaskRow } from '../components/TaskRow';
import { Select } from '../components/Select';
import { InlineTaskCreate } from '../components/InlineTaskCreate';
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

export function Tasks() {
    const { tasks, setTasks, taskLoading, totalPages, fetchTasks, updateTask, deleteTask, createTask } = useAppStore();
    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [showMobileCreate, setShowMobileCreate] = useState(false);
    const [mobileTaskTitle, setMobileTaskTitle] = useState('');
    const [mobileTaskPriority, setMobileTaskPriority] = useState('medium');
    const [isMobileCreating, setIsMobileCreating] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchTasks({
            page,
            size: 20,
            ...(filterPriority && { priority: filterPriority }),
            sortBy: 'createdAt',
            sortDirection: 'desc',
        });
    }, [fetchTasks, page, filterPriority]);

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
                e.key === '/' &&
                document.activeElement?.tagName !== 'INPUT' &&
                document.activeElement?.tagName !== 'TEXTAREA'
            ) {
                e.preventDefault();
                (document.querySelector('.search-input') as HTMLInputElement)?.focus();
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, []);

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

    const filteredTasks = tasks.filter(task => {
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
            });
            setMobileTaskTitle('');
            setMobileTaskPriority('medium');
            setShowMobileCreate(false);
            fetchTasks({ page: 0, size: 20, sortBy: 'createdAt', sortDirection: 'desc' });
        } finally {
            setIsMobileCreating(false);
        }
    };

    const completedCount = tasks.filter(t => t.status === 'done').length;

    const PRIORITY_OPTS = [
        { value: 'low', label: '🟢 Low', color: '#10b981' },
        { value: 'medium', label: '🟡 Medium', color: '#f59e0b' },
        { value: 'high', label: '🔴 High', color: '#ef4444' },
        { value: 'critical', label: '🟣 Critical', color: '#8b5cf6' },
    ];

    return (
        <div className="tasks-page">

            {/* ── Page Header ── */}
            <header className="page-header--elite">
                <div className="page-title-group">
                    <h1 className="page-title">Tasks</h1>
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
                        placeholder="Search tasks... (/)"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <kbd className="kbd-hint">/</kbd>
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
                                        <TaskRow
                                            key={task.id}
                                            task={task}
                                            onToggle={handleStatusToggle}
                                            onDelete={handleDelete}
                                            onEdit={(t) => console.log('Edit task:', t)}
                                        />
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

            {/* ── Mobile FAB ── */}
            <button
                className="mobile-fab"
                onClick={() => setShowMobileCreate(true)}
                aria-label="Add task"
            >
                <span className="material-symbols-outlined">add</span>
            </button>

            {/* ── Mobile Task Bottom Sheet ── */}
            {showMobileCreate && (
                <div className="mobile-sheet-backdrop" onClick={() => setShowMobileCreate(false)}>
                    <div className="mobile-task-sheet" onClick={e => e.stopPropagation()}>
                        <div className="mobile-sheet-handle" />
                        <h3 className="mobile-sheet-title">New Task</h3>

                        <input
                            className="mobile-sheet-input"
                            type="text"
                            placeholder="What needs to be done?"
                            value={mobileTaskTitle}
                            onChange={e => setMobileTaskTitle(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleMobileCreate(); }}
                            autoFocus
                        />

                        <div className="mobile-sheet-priority">
                            {PRIORITY_OPTS.map(opt => (
                                <button
                                    key={opt.value}
                                    className={`mobile-priority-chip ${mobileTaskPriority === opt.value ? 'active' : ''}`}
                                    style={{ '--chip-color': opt.color } as React.CSSProperties}
                                    onClick={() => setMobileTaskPriority(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

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
