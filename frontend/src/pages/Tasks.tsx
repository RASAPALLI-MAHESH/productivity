import { useEffect, useState, FormEvent } from 'react';
import { useAppStore } from '../store/appStore';
import type { Task } from '../types';

export function Tasks() {
    const { tasks, taskLoading, totalPages, fetchTasks, createTask, updateTask, deleteTask } = useAppStore();
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [page, setPage] = useState(0);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Task['priority']>('medium');
    const [status, setStatus] = useState<Task['status']>('todo');
    const [deadline, setDeadline] = useState('');

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
        setShowModal(true);
    };

    const openEdit = (task: Task) => {
        setEditingTask(task);
        setTitle(task.title);
        setDescription(task.description || '');
        setPriority(task.priority);
        setStatus(task.status);
        // Extract YYYY-MM-DD from ISO string for date input
        setDeadline(task.deadline ? task.deadline.slice(0, 10) : '');
        setShowModal(true);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const taskData: Record<string, unknown> = {
            title,
            description,
            priority,
            status,
        };

        if (deadline) {
            // Send as ISO 8601 string with end-of-day time
            taskData.deadline = new Date(deadline + 'T23:59:59').toISOString();
        } else {
            taskData.deadline = null;
        }

        if (editingTask) {
            await updateTask(editingTask.id, taskData);
        } else {
            await createTask(taskData);
        }
        setShowModal(false);
    };

    const handleStatusToggle = async (task: Task) => {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        await updateTask(task.id, { ...task, status: newStatus });
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Tasks</h1>
                    <p className="page-subtitle">Manage your tasks efficiently</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>+ New Task</button>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <select className="input" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}>
                    <option value="">All Status</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                </select>
                <select className="input" value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setPage(0); }}>
                    <option value="">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>
                <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="createdAt">Date Created</option>
                    <option value="deadline">Deadline</option>
                    <option value="priority">Priority</option>
                </select>
            </div>

            {/* Task List */}
            {taskLoading && !tasks.length ? (
                <div className="loader"><div className="spinner" /></div>
            ) : tasks.length ? (
                <>
                    <div className="task-list">
                        {tasks.map((task) => (
                            <div key={task.id} className="task-item">
                                <button
                                    className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`}
                                    onClick={() => handleStatusToggle(task)}
                                >
                                    {task.status === 'done' ? '✓' : ''}
                                </button>
                                <div className="task-info">
                                    <div className={`task-title ${task.status === 'done' ? 'completed' : ''}`}>
                                        {task.title}
                                    </div>
                                    <div className="task-meta">
                                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                                        <span className={`badge badge-${task.status}`}>{task.status}</span>
                                        {task.deadline && (() => {
                                            const deadlineDate = new Date(task.deadline);
                                            const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                            const isOverdue = daysLeft < 0;
                                            return (
                                                <span style={{ color: isOverdue ? 'var(--accent-critical)' : daysLeft <= 2 ? 'var(--accent-warning)' : 'var(--text-muted)' }}>
                                                    📅 {deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    {isOverdue ? ` (${Math.abs(daysLeft)}d overdue)` : daysLeft === 0 ? ' (today)' : ` (${daysLeft}d left)`}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                                <div className="task-actions">
                                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(task)}>✏️</button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => deleteTask(task.id)}>🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button className="pagination-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>←  Prev</button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button key={i} className={`pagination-btn ${page === i ? 'active' : ''}`} onClick={() => setPage(i)}>
                                    {i + 1}
                                </button>
                            ))}
                            <button className="pagination-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next  →</button>
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3>No tasks yet</h3>
                    <p>Create your first task to get started</p>
                    <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={openCreate}>
                        + Create Task
                    </button>
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
                            <div className="input-group" style={{ marginTop: 'var(--space-4)' }}>
                                <label className="input-label">Deadline</label>
                                <input type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={new Date().toISOString().split('T')[0]} />
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
    );
}
