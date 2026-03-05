import React, { useState, useRef, useEffect } from 'react';
import { useHabitStore } from '../store/habitStore';
import { Habit } from '../types';

interface HabitRowProps {
    habit: Habit;
    index: number;
    onSparklineClick: () => void;
}

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const HabitRow: React.FC<HabitRowProps> = ({ habit, index, onSparklineClick }) => {
    const { toggleCompletion, updateHabit, deleteHabit, habitLogs } = useHabitStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(habit.name);
    const inputRef = useRef<HTMLInputElement>(null);

    const todayStr = new Date().toISOString().split('T')[0];
    const logs = habitLogs[habit.id] || [];
    const isCompletedToday = logs.some((l) => l.date === todayStr && l.completed);

    // Build weekly matrix (Mon-Sun)
    const getWeekMatrix = () => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));

        return WEEKDAY_LABELS.map((label, i) => {
            const loopDate = new Date(startOfWeek);
            loopDate.setDate(startOfWeek.getDate() + i);
            const dateStr = loopDate.toISOString().split('T')[0];
            const completed = logs.some(l => l.date === dateStr && l.completed);
            const isToday = dateStr === todayStr;

            return (
                <div
                    key={dateStr}
                    className={`matrix-day${completed ? ' filled' : ''}${isToday ? ' today' : ''}`}
                    title={dateStr}
                >
                    {label}
                </div>
            );
        });
    };

    useEffect(() => {
        if (isEditing && inputRef.current) inputRef.current.focus();
    }, [isEditing]);

    const handleSaveEdit = () => {
        if (editName.trim() && editName !== habit.name) {
            updateHabit(habit.id, { name: editName.trim() });
        } else {
            setEditName(habit.name);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSaveEdit();
        if (e.key === 'Escape') { setEditName(habit.name); setIsEditing(false); }
    };

    const handleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isCompletedToday) return;
        toggleCompletion(habit.id, todayStr);
    };

    return (
        <div
            className={`habit-row animate-row-enter${isCompletedToday ? ' is-completed' : ''}`}
            style={{ animationDelay: `${index * 40}ms` }}
        >
            {/* Checkbox */}
            <button
                className={`habit-check${isCompletedToday ? ' completed' : ''}`}
                onClick={handleComplete}
                disabled={isCompletedToday}
                aria-label={isCompletedToday ? 'Completed' : 'Mark as complete'}
            >
                <span className="material-symbols-outlined">check</span>
            </button>

            {/* Info */}
            <div className="habit-info">
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        className="habit-inline-edit"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1px solid var(--border-hover)',
                            color: 'var(--text-primary)',
                            fontSize: '15px',
                            fontWeight: 500,
                            outline: 'none',
                            padding: '0 0 2px',
                            width: '100%',
                        }}
                    />
                ) : (
                    <span
                        className="habit-name"
                        onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                    >
                        {habit.name}
                    </span>
                )}
                <span className="habit-category">{habit.category || 'General'}</span>
            </div>

            {/* Weekly Matrix */}
            <div className="habit-matrix">
                {getWeekMatrix()}
            </div>

            {/* Streak */}
            <div className={`habit-streak${habit.currentStreak >= 7 ? ' hot' : ''}`}>
                {habit.currentStreak > 0 && (
                    <>
                        <span className="material-symbols-outlined">local_fire_department</span>
                        {habit.currentStreak}
                    </>
                )}
            </div>

            {/* Hover Actions */}
            <div className="habit-actions">
                <button
                    className="btn-icon-subtle"
                    onClick={(e) => { e.stopPropagation(); onSparklineClick(); }}
                    title="View Analytics"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>insights</span>
                </button>
                <button
                    className="btn-icon-subtle"
                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                    title="Edit"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                </button>
                <button
                    className="btn-icon-subtle"
                    onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); }}
                    title="Delete"
                    style={{ color: 'var(--error)' }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                </button>
            </div>
        </div>
    );
};
