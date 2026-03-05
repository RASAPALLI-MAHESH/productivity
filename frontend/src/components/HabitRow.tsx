import React, { useState, useRef, useEffect } from 'react';
import { useHabitStore } from '../store/habitStore';
import { Habit } from '../types';

interface HabitRowProps {
    habit: Habit;
    onSparklineClick: () => void;
}

export const HabitRow: React.FC<HabitRowProps> = ({ habit, onSparklineClick }) => {
    const { toggleCompletion, updateHabit, deleteHabit, habitLogs } = useHabitStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(habit.name);
    const [showMenu, setShowMenu] = useState(false);
    const [showXP, setShowXP] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const todayStr = new Date().toISOString().split('T')[0];
    const logs = habitLogs[habit.id] || [];
    const isCompletedToday = logs.some((l) => l.date === todayStr && l.completed);

    // Weekday Tracker Logic (M T W T F S S)
    const getWeekdayCircles = () => {
        const circles = [];
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday

        for (let i = 0; i < 7; i++) {
            const loopDate = new Date(startOfWeek);
            loopDate.setDate(startOfWeek.getDate() + i);
            const dateStr = loopDate.toISOString().split('T')[0];
            const completed = logs.some(l => l.date === dateStr && l.completed);

            circles.push(
                <div
                    key={dateStr}
                    title={dateStr}
                    className={`weekday-circle ${completed ? 'completed' : ''} ${dateStr === todayStr ? 'today' : ''}`}
                >
                    {completed ? '●' : '○'}
                </div>
            );
        }
        return circles;
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
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
        if (e.key === 'Escape') {
            setEditName(habit.name);
            setIsEditing(false);
        }
    };

    const handleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isCompletedToday) return;

        setShowXP(true);
        toggleCompletion(habit.id, todayStr);
        setTimeout(() => setShowXP(false), 1500);
    };

    return (
        <div className="habit-row" onClick={() => !isEditing && onSparklineClick()}>

            {showXP && <div className="xp-float">+XP</div>}

            <div className="habit-row-left">
                <button
                    className={`habit-checkbox ${isCompletedToday ? 'checked' : ''}`}
                    onClick={handleComplete}
                    disabled={isCompletedToday}
                >
                    {isCompletedToday && <span className="material-icons">check</span>}
                </button>

                <div className="habit-row-info">
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            className="habit-inline-edit-input"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={handleSaveEdit}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <div className="habit-name" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
                            {habit.name}
                        </div>
                    )}
                    <div className="habit-meta">
                        <span className="habit-category">{habit.category || 'General'}</span>
                        {habit.currentStreak > 0 && (
                            <span className="habit-streak">
                                🔥 {habit.currentStreak}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="habit-row-center">
                <div className="weekday-tracker">
                    <div className="weekday-labels">
                        <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                    </div>
                    <div className="weekday-circles">
                        {getWeekdayCircles()}
                    </div>
                </div>
            </div>

            <div className="habit-row-right">
                <button
                    className="habit-sparkline-btn"
                    onClick={(e) => { e.stopPropagation(); onSparklineClick(); }}
                    title="View Analytics"
                >
                    <span className="material-icons">insights</span>
                </button>

                <div className="habit-menu-container" ref={menuRef}>
                    <button
                        className="habit-menu-btn"
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    >
                        •••
                    </button>
                    {showMenu && (
                        <div className="habit-dropdown-menu">
                            <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false); }}>
                                Edit Name
                            </button>
                            <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); setShowMenu(false); }}>
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
