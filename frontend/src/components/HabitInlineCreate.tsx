import React, { useState, useRef, useEffect } from 'react';
import { useHabitStore } from '../store/habitStore';

export const HabitInlineCreate: React.FC = () => {
    const { createHabit } = useHabitStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [name, setName] = useState('');
    const [category, setCategory] = useState<'health' | 'learning' | 'work' | 'personal'>('health');
    const [frequency] = useState<'daily' | 'weekly'>('daily');

    // New scheduling states
    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(todayStr);
    const [targetTime, setTargetTime] = useState('');

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                if (!name.trim()) {
                    setIsExpanded(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [name]);

    const handleCreate = async () => {
        if (!name.trim()) return;

        const newHabitPayload: any = {
            name: name.trim(),
            category,
            frequency,
            goalType: 'yesno',
            goalValue: 1,
            difficulty: 3,
            startDate,
        };

        if (targetTime) {
            newHabitPayload.targetTime = targetTime;
        }

        await createHabit(newHabitPayload);

        // Reset
        setName('');
        setStartDate(todayStr);
        setTargetTime('');
        setIsExpanded(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCreate();
        }
        if (e.key === 'Escape') {
            setName('');
            setIsExpanded(false);
        }
    };

    if (!isExpanded) {
        return (
            <button className="habit-inline-create-trigger" onClick={() => setIsExpanded(true)}>
                <span className="material-symbols-outlined">add</span>
                Add Habit
            </button>
        );
    }

    return (
        <div className="habit-inline-create-container" ref={containerRef}>
            <div className="habit-inline-create-form">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Habit name (e.g., Morning Meditation)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="habit-inline-create-input primary-input"
                />

                <div className="habit-inline-create-row secondary-inputs">
                    <div className="inline-group">
                        <span className="material-symbols-outlined input-icon">category</span>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as any)}
                            className="habit-inline-select"
                        >
                            <option value="health">Health</option>
                            <option value="learning">Learning</option>
                            <option value="work">Work</option>
                            <option value="personal">Personal</option>
                        </select>
                    </div>

                    <div className="inline-group">
                        <span className="material-symbols-outlined input-icon">event</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="habit-inline-date-picker"
                            min={todayStr}
                            title="Start Date"
                        />
                    </div>

                    <div className="inline-group">
                        <span className="material-symbols-outlined input-icon">schedule</span>
                        <input
                            type="time"
                            value={targetTime}
                            onChange={(e) => setTargetTime(e.target.value)}
                            className="habit-inline-time-picker"
                            title="Specific Time (Optional)"
                        />
                    </div>

                    <button
                        className={`habit-inline-save-btn ${name.trim() ? 'active' : ''}`}
                        onClick={handleCreate}
                        disabled={!name.trim()}
                    >
                        Save Habit
                    </button>
                </div>
            </div>
        </div>
    );
};
