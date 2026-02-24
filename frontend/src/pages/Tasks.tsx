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

            {/* ── Momentum Bar (Top) ── */}
            <div className="momentum-container">
                <div
                    className="momentum-bar"
                    style={{ width: `${(completedCount / (tasks.length || 1)) * 100}%` }}
                />
            </div>

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
                        placeholder="Search or filter... (/)"
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

                {/* Inline creation (Desktop) */}
                <div className="inline-create-container--elite">
                    <InlineTaskCreate
                        autoOpen={isAddingTask}
                        onClose={() => setIsAddingTask(false)}
                    />
                </div>

                {/* Task list */}
                {taskLoading ? (
                    <div className="task-list-v2" style={{ marginTop: 4 }}>
                        {[...Array(5)].map((_, i) => <div key={i} className="elite-row skeleton" style={{ height: 48 }} />)}
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
                        <p>{searchQuery ? 'Try a different search term.' : 'Add your first task to get moving.'}</p>
                    </div>
                )}
            </div>

            {/* Mobile FAB */}
            <button className="fab-elite" onClick={() => setIsAddingTask(true)}>
                <span className="material-symbols-outlined">add</span>
            </button>

            <UndoToast />
        </div>
    );
}
