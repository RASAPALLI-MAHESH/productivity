import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import type { Task } from '../types';
import { TaskRow } from '../components/TaskRow';
import { Select } from '../components/Select';
import { TaskSkeleton } from '../components/TaskSkeleton';
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
    const { tasks, setTasks, taskLoading, totalPages, fetchTasks, updateTask, deleteTask } = useAppStore();
    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');

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

    const completedCount = tasks.filter(t => t.status === 'done').length;

    return (
        <div className="tasks-page">

            {/* ── Page Header ── */}
            <div className="page-header" style={{ paddingBottom: 0 }}>
                <div className="page-title-group">
                    <h1 className="page-title">Tasks</h1>
                    {tasks.length > 0 && (
                        <p className="page-subtitle-stats">
                            {completedCount} of {tasks.length} completed
                        </p>
                    )}
                </div>
            </div>

            {/* ── Filter Toolbar ── */}
            <div className="task-filters-unified-v2">
                <div className="task-search-minimal">
                    <span className="material-symbols-outlined search-icon-v2">
                        {isSearching ? 'sync' : 'search'}
                    </span>
                    <input
                        type="text"
                        className="search-input-v2"
                        placeholder="Search tasks... (/)"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-group-minimal">
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
            <div style={{ padding: '16px 32px 0' }}>

                {/* Inline creation */}
                <InlineTaskCreate
                    autoOpen={isAddingTask}
                    onClose={() => setIsAddingTask(false)}
                />

                {/* Task list */}
                {taskLoading ? (
                    <div className="task-list-v2" style={{ marginTop: 4 }}>
                        {[...Array(5)].map((_, i) => <TaskSkeleton key={i} />)}
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
                                <div className="task-list-v2">
                                    {filteredTasks.map(task => (
                                        <TaskRow
                                            key={task.id}
                                            task={task}
                                            onToggle={handleStatusToggle}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination" style={{ marginTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
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
                    <div className="empty-state">
                        <div className="empty-icon">
                            <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                                {searchQuery ? 'search_off' : 'edit_note'}
                            </span>
                        </div>
                        <h3 style={{ marginTop: 0, fontSize: 18, color: 'var(--text-primary)' }}>
                            {searchQuery ? `No results for "${searchQuery}"` : 'No tasks yet'}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: 280, margin: '8px auto 24px', fontSize: 14 }}>
                            {searchQuery
                                ? 'Try a different search term.'
                                : 'Stay organized — add your first task and get things moving.'}
                        </p>
                        {!searchQuery && (
                            <button className="btn btn-primary" onClick={() => setIsAddingTask(true)} style={{ height: 40 }}>
                                <span className="material-symbols-outlined icon-sm">add</span>
                                Create Task
                            </button>
                        )}
                    </div>
                )}
            </div>

            <UndoToast />
        </div>
    );
}
