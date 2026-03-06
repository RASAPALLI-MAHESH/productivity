import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { WeekNavigator } from '../components/WeekNavigator';
import { DeadlineRow } from '../components/DeadlineRow';
import { DateTimePicker } from '../components/DateTimePicker';
import type { Task } from '../types';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    useDraggable,
    useDroppable,
} from '@dnd-kit/core';

// ─── Helpers ─────────────────────────────────────────────────────────────
function getWeekStart(d: Date): Date {
    const x = new Date(d);
    const day = x.getDay();
    const diff = x.getDate() - day;
    x.setDate(diff);
    x.setHours(0, 0, 0, 0);
    return x;
}

function toDateOnly(iso: string): string {
    const d = new Date(iso);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
}

function getDaysLeft(deadline: string): number {
    const d = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

type FilterMode = 'all' | 'today' | 'overdue' | 'week' | 'later';

// ─── Draggable task (for overlay) ─────────────────────────────────────────
function DraggableTaskCard({ task }: { task: Task }) {
    return (
        <div className="deadline-row deadline-row--dragging">
            <div className="deadline-row__checkbox checked"><span className="material-symbols-outlined">check</span></div>
            <div className="deadline-row__body">
                <span className="deadline-row__title">{task.title}</span>
                <div className="deadline-row__meta">
                    <span className="deadline-row__priority-label">{task.priority}</span>
                </div>
            </div>
        </div>
    );
}

// ─── Drop target for a day ────────────────────────────────────────────────
function DayDropTarget({
    date,
    label,
    isOver,
    taskCount,
}: { date: Date; label: string; isOver: boolean; taskCount: number }) {
    const { setNodeRef, isOver: isDndOver } = useDroppable({ id: `day-${date.toISOString().slice(0, 10)}` });
    const over = isOver || isDndOver;
    return (
        <div
            ref={setNodeRef}
            className={`deadlines-calendar-day ${over ? 'drop-target' : ''}`}
            data-date={date.toISOString().slice(0, 10)}
        >
            <span className="deadlines-calendar-day__label">{label}</span>
            <span className="deadlines-calendar-day__count">{taskCount}</span>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────
export function Deadlines() {
    const { tasks, fetchTasks, updateTask, deleteTask, createTask } = useAppStore();
    const [filter, setFilter] = useState<FilterMode>('all');
    const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [quickAddOpen, setQuickAddOpen] = useState(false);
    const [schedulerTask, setSchedulerTask] = useState<Task | null>(null);
    const [rescheduleUndo, setRescheduleUndo] = useState<{ id: string; from: string } | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        fetchTasks({ page: 0, size: 500, sortBy: 'deadline', sortDirection: 'asc' }).catch(() => { });
    }, [fetchTasks]);

    const tasksWithDeadlines = useMemo(() => {
        return tasks
            .filter((t): t is Task & { deadline: string } => !!t.deadline && t.status !== 'done')
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }, [tasks]);

    const { overdue, today, tomorrow, thisWeek, later } = useMemo(() => {
        const now = new Date();
        const todayStr = now.toDateString();
        const tomorrowDate = new Date(now);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const tomorrowStr = tomorrowDate.toDateString();
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const overdue: Task[] = [];
        const today: Task[] = [];
        const tomorrow: Task[] = [];
        const thisWeek: Task[] = [];
        const later: Task[] = [];

        tasksWithDeadlines.forEach((t) => {
            const d = new Date(t.deadline!);
            const days = getDaysLeft(t.deadline!);
            const dateStr = d.toDateString();
            if (days < 0) overdue.push(t);
            else if (dateStr === todayStr) today.push(t);
            else if (dateStr === tomorrowStr) tomorrow.push(t);
            else if (d <= weekEnd && dateStr >= weekStart.toDateString()) thisWeek.push(t);
            else later.push(t);
        });
        return { overdue, today, tomorrow, thisWeek, later };
    }, [tasksWithDeadlines, weekStart]);

    const filteredGroups = useMemo(() => {
        if (filter === 'today') return [{ key: 'today', label: 'Today', items: today }];
        if (filter === 'overdue') return [{ key: 'overdue', label: 'Overdue', items: overdue }];
        if (filter === 'week') return [
            { key: 'overdue', label: 'Overdue', items: overdue },
            { key: 'today', label: 'Today', items: today },
            { key: 'tomorrow', label: 'Tomorrow', items: tomorrow },
            { key: 'thisWeek', label: 'This week', items: thisWeek },
        ];
        if (filter === 'later') return [{ key: 'later', label: 'Later', items: later }];
        return [
            { key: 'overdue', label: 'Overdue', items: overdue },
            { key: 'today', label: 'Today', items: today },
            { key: 'tomorrow', label: 'Tomorrow', items: tomorrow },
            { key: 'thisWeek', label: 'This week', items: thisWeek },
            { key: 'later', label: 'Later', items: later },
        ];
    }, [filter, overdue, today, tomorrow, thisWeek, later]);

    const handleToggle = useCallback((task: Task) => {
        updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' });
    }, [updateTask]);

    const handleReschedule = useCallback((taskId: string, newDeadline: string) => {
        const task = tasks.find((t) => t.id === taskId);
        const from = task?.deadline ?? new Date().toISOString();
        updateTask(taskId, { deadline: newDeadline });
        setRescheduleUndo({ id: taskId, from });
        setTimeout(() => setRescheduleUndo(null), 5000);
    }, [tasks, updateTask]);

    const handleUndoReschedule = useCallback(() => {
        if (!rescheduleUndo) return;
        updateTask(rescheduleUndo.id, { deadline: rescheduleUndo.from });
        setRescheduleUndo(null);
    }, [rescheduleUndo, updateTask]);

    const handleEditDate = useCallback((task: Task) => setSchedulerTask(task), []);
    const handleSchedulerSave = useCallback((iso: string) => {
        if (schedulerTask) {
            updateTask(schedulerTask.id, { deadline: iso });
            setSchedulerTask(null);
        }
    }, [schedulerTask, updateTask]);

    const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
    }), [weekStart]);

    const tasksByDay = useMemo(() => {
        const map: Record<string, Task[]> = {};
        weekDays.forEach((d) => {
            const key = d.toISOString().slice(0, 10);
            map[key] = tasksWithDeadlines.filter((t) => toDateOnly(t.deadline!) === key);
        });
        return map;
    }, [weekDays, tasksWithDeadlines]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const handleDragStart = useCallback((e: DragStartEvent) => {
        setActiveId(String(e.active.id));
    }, []);

    const handleDragEnd = useCallback((e: DragEndEvent) => {
        setActiveId(null);
        const taskId = String(e.active.id);
        if (taskId.startsWith('task-')) {
            const id = taskId.replace('task-', '');
            const overId = e.over?.id;
            if (overId && String(overId).startsWith('day-')) {
                const dateStr = String(overId).replace('day-', '');
                const task = tasks.find((t) => t.id === id);
                if (task?.deadline) {
                    const d = new Date(task.deadline);
                    const [y, m, day] = dateStr.split('-').map(Number);
                    d.setFullYear(y, m - 1, day);
                    handleReschedule(id, d.toISOString());
                }
            }
        }
    }, [tasks, handleReschedule]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.target && (e.target as HTMLElement).closest('input, textarea, [contenteditable]')) return;
            if (e.key === 'n' || e.key === 'N') {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    setQuickAddOpen(true);
                }
            }
            if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                setQuickAddOpen(true);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const activeTask = activeId && activeId.startsWith('task-')
        ? tasks.find((t) => t.id === activeId.replace('task-', ''))
        : null;

    const totalWithDeadlines = tasksWithDeadlines.length;
    const isEmpty = totalWithDeadlines === 0;

    return (
        <div className="deadlines-page">
            <aside className="deadlines-rail">
                <div className="deadlines-rail__title">Deadlines</div>
                <nav className="deadlines-filters" aria-label="Filter deadlines">
                    <button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
                    <button type="button" className={filter === 'today' ? 'active' : ''} onClick={() => setFilter('today')}>Today</button>
                    <button type="button" className={filter === 'overdue' ? 'active' : ''} onClick={() => setFilter('overdue')}>Overdue</button>
                    <button type="button" className={filter === 'week' ? 'active' : ''} onClick={() => setFilter('week')}>This week</button>
                    <button type="button" className={filter === 'later' ? 'active' : ''} onClick={() => setFilter('later')}>Later</button>
                </nav>
                <WeekNavigator
                    weekStart={weekStart}
                    onPrevWeek={() => setWeekStart((d) => { const x = new Date(d); x.setDate(x.getDate() - 7); return x; })}
                    onNextWeek={() => setWeekStart((d) => { const x = new Date(d); x.setDate(x.getDate() + 7); return x; })}
                    onToday={() => setWeekStart(getWeekStart(new Date()))}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
                <p className="deadlines-rail-hint">Plan your week — drag to reschedule.</p>
            </aside>

            <main className="deadlines-main">
                <div className="deadlines-main-top">
                    <WeekNavigator
                        weekStart={weekStart}
                        onPrevWeek={() => setWeekStart((d) => { const x = new Date(d); x.setDate(x.getDate() - 7); return x; })}
                        onNextWeek={() => setWeekStart((d) => { const x = new Date(d); x.setDate(x.getDate() + 7); return x; })}
                        onToday={() => setWeekStart(getWeekStart(new Date()))}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                    />
                    <button type="button" className="deadlines-quick-add-btn" onClick={() => setQuickAddOpen(true)}>
                        <span className="material-symbols-outlined">add</span> Add deadline
                    </button>
                </div>

                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="deadlines-two-pane">
                        <div className="deadlines-list-pane">
                            {isEmpty ? (
                                <div className="deadlines-empty" role="status">
                                    <span className="material-symbols-outlined">schedule</span>
                                    <h3>No deadlines yet</h3>
                                    <p>Add a deadline to a task to see it here.</p>
                                    <button type="button" className="deadlines-empty-cta" onClick={() => setQuickAddOpen(true)}>
                                        Add deadline
                                    </button>
                                    <span className="deadlines-empty-kbd">Press N to add</span>
                                </div>
                            ) : (
                                filteredGroups.map((group) => (
                                    group.items.length > 0 && (
                                        <section key={group.key} className="deadlines-day-group">
                                            <h3 className="deadlines-day-group__title">{group.label}</h3>
                                            <div className="deadlines-day-group__list">
                                                {group.items.map((task) => (
                                                    <DraggableRow
                                                        key={task.id}
                                                        task={task}
                                                        onToggle={handleToggle}
                                                        onReschedule={handleReschedule}
                                                        onEditDate={handleEditDate}
                                                        onDelete={deleteTask}
                                                    />
                                                ))}
                                            </div>
                                        </section>
                                    )
                                ))
                            )}
                        </div>

                        <div className="deadlines-calendar-pane">
                            <div className="deadlines-calendar-week" role="group" aria-label="Week view">
                                {weekDays.map((d) => (
                                    <DayDropTarget
                                        key={d.toISOString()}
                                        date={d}
                                        label={d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                                        isOver={false}
                                        taskCount={tasksByDay[d.toISOString().slice(0, 10)]?.length ?? 0}
                                    />
                                ))}
                            </div>
                            <div className="deadlines-calendar-list">
                                {weekDays.map((d) => {
                                    const key = d.toISOString().slice(0, 10);
                                    const dayTasks = tasksByDay[key] ?? [];
                                    return (
                                        <div key={key} className="deadlines-calendar-day-column">
                                            <span className="deadlines-calendar-day-column__label">
                                                {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                            {dayTasks.map((t) => (
                                                <div key={t.id} className="deadlines-calendar-day-task">
                                                    <span className="deadlines-calendar-day-task__title">{t.title}</span>
                                                    <span className="deadlines-calendar-day-task__time">
                                                        {new Date(t.deadline!).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <DragOverlay dropAnimation={null}>
                        {activeTask ? <DraggableTaskCard task={activeTask} /> : null}
                    </DragOverlay>
                </DndContext>
            </main>

            {rescheduleUndo && (
                <div className="deadlines-toast">
                    <span>Moved — </span>
                    <button type="button" onClick={handleUndoReschedule}>Undo</button>
                </div>
            )}

            {quickAddOpen && (
                <QuickAddModal
                    onClose={() => setQuickAddOpen(false)}
                    onCreate={(title, deadline) => {
                        createTask({ title, deadline: deadline || undefined });
                        setQuickAddOpen(false);
                    }}
                />
            )}

            {schedulerTask && (
                <div className="deadlines-scheduler-overlay" role="dialog" aria-label="Edit deadline">
                    <div className="deadlines-scheduler">
                        <h3>Edit deadline</h3>
                        <DateTimePicker
                            value={schedulerTask.deadline ?? new Date().toISOString()}
                            onChange={(iso) => handleSchedulerSave(iso)}
                        />
                        <div className="deadlines-scheduler-actions">
                            <button type="button" onClick={() => setSchedulerTask(null)}>Cancel</button>
                            <button type="button" onClick={() => { if (schedulerTask) { updateTask(schedulerTask.id, { deadline: null }); setSchedulerTask(null); } }}>Remove deadline</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Draggable row (wraps DeadlineRow with dnd-kit) ───────────────────────
function DraggableRow({
    task,
    onToggle,
    onReschedule,
    onEditDate,
    onDelete,
}: {
    task: Task;
    onToggle: (t: Task) => void;
    onReschedule: (id: string, d: string) => void;
    onEditDate: (t: Task) => void;
    onDelete: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `task-${task.id}` });
    return (
        <div ref={setNodeRef} {...listeners} {...attributes} className={isDragging ? 'deadline-row-wrapper dragging' : 'deadline-row-wrapper'}>
            <DeadlineRow
                task={task}
                onToggle={onToggle}
                onReschedule={onReschedule}
                onEditDate={onEditDate}
                onDelete={onDelete}
            />
        </div>
    );
}

// ─── Quick add modal ───────────────────────────────────────────────────────
function QuickAddModal({
    onClose,
    onCreate,
}: { onClose: () => void; onCreate: (title: string, deadline: string | null) => void }) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(() => {
        const d = new Date();
        d.setHours(9, 0, 0, 0);
        return d.toISOString().slice(0, 16);
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const t = title.trim();
        if (!t) return;
        const iso = date ? new Date(date).toISOString() : null;
        onCreate(t, iso);
    };

    return (
        <div className="deadlines-quickadd-overlay" onClick={onClose}>
            <div className="deadlines-quickadd" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Quick add task with deadline">
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Task name (e.g. Review doc tomorrow 5pm)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                        className="deadlines-quickadd-input"
                    />
                    <div className="deadlines-quickadd-date">
                        <label>Due</label>
                        <input
                            type="datetime-local"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="deadlines-quickadd-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Add</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
