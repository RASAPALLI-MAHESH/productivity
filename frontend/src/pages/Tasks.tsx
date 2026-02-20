import { useEffect, useState, FormEvent, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import type { Task } from '../types';
import { TaskRow } from '../components/TaskRow';
import { Select } from '../components/Select';

export function Tasks() {
    const { tasks, taskLoading, totalPages, fetchTasks, createTask, updateTask, deleteTask } = useAppStore();
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    // Filters
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Task['priority']>('medium');
    const [status, setStatus] = useState<Task['status']>('todo');
    const [deadline, setDeadline] = useState('');
    const [estimatedMinutes, setEstimatedMinutes] = useState<number | ''>('');
    const [energyLevel, setEnergyLevel] = useState<Task['energyLevel']>('medium');
    const [context, setContext] = useState<string[]>([]);
    const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

    useEffect(() => {
        fetchTasks({
            page,
            size: 20,
            ...(filterStatus && { status: filterStatus }),
            ...(filterPriority && { priority: filterPriority }),
            sortBy,
            sortDirection: 'desc',
        });
    }, [fetchTasks, page, filterStatus, filterPriority, sortBy]);

    const openCreate = () => {
        setEditingTask(null);
        setTitle('');
        setDescription('');
        setPriority('medium');
        setStatus('todo');
        setDeadline('');
        setEstimatedMinutes('');
        setEnergyLevel('medium');
        setContext([]);
        setSubtasks([]);
        setShowModal(true);
    };

    const openEdit = useCallback((task: Task) => {
        setEditingTask(task);
        setTitle(task.title);
        setDescription(task.description || '');
        setPriority(task.priority);
        setStatus(task.status);
        setDeadline(task.deadline ? task.deadline.slice(0, 10) : '');
        setEstimatedMinutes(task.estimatedMinutes || '');
        setEnergyLevel(task.energyLevel || 'medium');
        setContext(task.context || []);
        setSubtasks(task.subtasks || []);
        setShowModal(true);
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const taskData: Record<string, unknown> = {
            title,
            description,
            priority,
            status,
            estimatedMinutes: estimatedMinutes === '' ? null : Number(estimatedMinutes),
            energyLevel,
            context,
            subtasks
        };

        if (deadline) {
            taskData.deadline = new Date(deadline + 'T23:59:59').toISOString();
        } else {
            taskData.deadline = null;
        }

        try {
            if (editingTask) {
                await updateTask(editingTask.id, taskData);
            } else {
                await createTask(taskData);
            }
            setShowModal(false);
        } catch (error) {
            console.error('Failed to save task:', error);
            // Ideally use a toast here. For now, we'll rely on the console 
            // and maybe a future toast implementation could go here.
            alert("Failed to save task. Please try again.");
        }
    };

    const handleStatusToggle = useCallback(async (task: Task) => {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        await updateTask(task.id, { ...task, status: newStatus });
    }, [updateTask]);

    const handleDelete = useCallback(async (id: string) => {
        await deleteTask(id);
    }, [deleteTask]);

    // Client-side filtering for search query (since backend doesn't support it yet)
    const filteredTasks = tasks.filter(task => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return task.title.toLowerCase().includes(query) ||
            (task.description && task.description.toLowerCase().includes(query));
    });

    // const paginatedTasks = filteredTasks; // With backend pagination, this is tricky. 
    // Ideally we'd search on backend. For now, we search within the loaded page.
    // NOTE: This searches only CURRENT PAGE if backend paging is active. 
    // If the user wants global search, backend update is needed. 
    // Assuming user wants immediate feedback on loaded tasks for now.

    const handleSearchClose = () => {
        setSearchQuery('');
        setIsMobileSearchOpen(false);
    };

    return (
        <div className="tasks-page">
            {/* Header with Search Mode Logic */}
            <div className={`page-header ${isMobileSearchOpen ? 'search-active' : ''}`}>
                {!isMobileSearchOpen && (
                    <div>
                        <h1 className="page-title">Tasks</h1>
                        <p className="page-subtitle">Manage your daily work</p>
                    </div>
                )}

                <div className="tasks-header-actions">
                    {/* Search Container */}
                    <div className="task-search-container">
                        <div className="search-input-wrapper">
                            <span className="material-symbols-outlined search-icon">search</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus={isMobileSearchOpen}
                            />
                            {isMobileSearchOpen && (
                                <button className="search-close-btn" onClick={handleSearchClose}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Search Trigger */}
                    {!isMobileSearchOpen && (
                        <button
                            className="mobile-search-trigger"
                            onClick={() => setIsMobileSearchOpen(true)}
                            aria-label="Search"
                        >
                            <span className="material-symbols-outlined">search</span>
                        </button>
                    )}

                    {/* New Task Button - Hidden when search is open on mobile */}
                    <button
                        className="btn btn-primary"
                        onClick={openCreate}
                        style={{ display: isMobileSearchOpen ? 'none' : 'flex' }}
                    >
                        <span className="material-symbols-outlined icon-sm">add</span>
                        <span className="btn-text">New Task</span>
                    </button>
                </div>
            </div>

            <div className="filter-toolbar">
                <Select
                    label="Status"
                    value={filterStatus}
                    onChange={(val) => { setFilterStatus(val); setPage(0); }}
                    options={[
                        { value: '', label: 'All Status' },
                        { value: 'todo', label: 'To Do' },
                        { value: 'in-progress', label: 'In Progress' },
                        { value: 'done', label: 'Done' }
                    ]}
                />
                <Select
                    label="Priority"
                    value={filterPriority}
                    onChange={(val) => { setFilterPriority(val); setPage(0); }}
                    options={[
                        { value: '', label: 'All Priority' },
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' },
                        { value: 'critical', label: 'Critical' }
                    ]}
                />
                <Select
                    label="Sort By"
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                        { value: 'createdAt', label: 'Date Created' },
                        { value: 'deadline', label: 'Deadline' },
                        { value: 'priority', label: 'Priority' }
                    ]}
                />
            </div>

            {/* Search could be added here in future following the same pattern */}

            <div style={{ padding: '0 24px' }}>
                {/* Task List */}
                {taskLoading ? (
                    <div className="loader">
                        <div className="spinner"></div>
                    </div>
                ) : filteredTasks.length > 0 ? (
                    <>
                        <div className="task-list" style={{ marginTop: 'var(--space-2)' }}>
                            {filteredTasks.map((task) => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    onToggle={handleStatusToggle}
                                    onEdit={openEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>

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
                    <div className="empty-state" style={{ padding: '80px 0' }}>
                        <div className="empty-icon" style={{ background: 'var(--bg-tertiary)', width: '64px', height: '64px', borderRadius: '16px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                                {searchQuery ? 'search_off' : 'edit_note'}
                            </span>
                        </div>
                        <h3 style={{ marginTop: '24px', fontSize: '18px' }}>
                            {searchQuery ? `No tasks found for "${searchQuery}"` : 'No tasks yet'}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '300px', margin: '8px auto 24px' }}>
                            {searchQuery ? 'Try a different search term.' : 'Stay organized by adding your first task. Everything starts with a single step.'}
                        </p>
                        {!searchQuery && (
                            <button className="btn btn-primary" onClick={openCreate} style={{ height: '40px' }}>
                                <span className="material-symbols-outlined icon-sm">add</span>
                                Create Task
                            </button>
                        )}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <h2 className="modal-title">{editingTask ? 'Edit Task' : 'New Task'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <label className="input-label">Title</label>
                                    <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="What needs to be done?" />
                                </div>
                                <div className="input-group" style={{ marginTop: 'var(--space-4)' }}>
                                    <label className="input-label">Description</label>
                                    <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details..." />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                                    <div className="input-group">
                                        <label className="input-label">Priority</label>
                                        <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])}>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Status</label>
                                        <select className="input" value={status} onChange={(e) => setStatus(e.target.value as Task['status'])}>
                                            <option value="todo">To Do</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="done">Done</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                                    <div className="input-group">
                                        <label className="input-label">Deadline</label>
                                        <input type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Estimate (mins)</label>
                                        <input type="number" className="input" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 30" />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                                    <div className="input-group">
                                        <label className="input-label">Energy Level</label>
                                        <div className="energy-selector">
                                            {(['low', 'medium', 'high'] as const).map(level => (
                                                <button
                                                    key={level}
                                                    type="button"
                                                    className={`energy-btn ${energyLevel === level ? 'active' : ''}`}
                                                    onClick={() => setEnergyLevel(level)}
                                                    title={`${level.charAt(0).toUpperCase() + level.slice(1)} Energy`}
                                                >
                                                    <span className="material-symbols-outlined">
                                                        {level === 'low' ? 'battery_low' : level === 'medium' ? 'battery_50' : 'battery_full'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Context</label>
                                        <div className="context-chips">
                                            {['Home', 'Office', 'Mobile', 'Laptop'].map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    className={`context-chip ${context.includes(c) ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setContext(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
                                                    }}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="input-group" style={{ marginTop: 'var(--space-4)' }}>
                                    <label className="input-label">Subtasks</label>
                                    <div className="subtask-input-row">
                                        <input
                                            className="input"
                                            value={newSubtaskTitle}
                                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                            placeholder="Add a subtask..."
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (newSubtaskTitle.trim()) {
                                                        setSubtasks([...subtasks, { id: crypto.randomUUID(), title: newSubtaskTitle.trim(), completed: false }]);
                                                        setNewSubtaskTitle('');
                                                    }
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                if (newSubtaskTitle.trim()) {
                                                    setSubtasks([...subtasks, { id: crypto.randomUUID(), title: newSubtaskTitle.trim(), completed: false }]);
                                                    setNewSubtaskTitle('');
                                                }
                                            }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="subtasks-list">
                                        {subtasks.map(st => (
                                            <div key={st.id} className="subtask-item">
                                                <input
                                                    type="checkbox"
                                                    checked={st.completed}
                                                    onChange={() => setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s))}
                                                />
                                                <span className={st.completed ? 'completed' : ''}>{st.title}</span>
                                                <button
                                                    type="button"
                                                    className="btn-icon"
                                                    onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))}
                                                >
                                                    <span className="material-symbols-outlined icon-xs">delete</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{editingTask ? 'Save Changes' : 'Create Task'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
