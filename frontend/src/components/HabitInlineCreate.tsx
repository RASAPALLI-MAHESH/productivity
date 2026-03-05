import React, { useState, useRef, useEffect } from 'react';
import { useHabitStore } from '../store/habitStore';

export const HabitInlineCreate: React.FC = () => {
    const { createHabit } = useHabitStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [name, setName] = useState('');
    const [category, setCategory] = useState<'health' | 'learning' | 'work' | 'personal'>('health');
    const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
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
        await createHabit({
            name: name.trim(),
            category,
            frequency,
            goalType: 'yesno',
            goalValue: 1,
            difficulty: 3
        });
        setName('');
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
                <span className="material-icons">add</span>
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
                    placeholder="Habit name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="habit-inline-create-input"
                />

                <div className="habit-inline-create-actions">
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

                    <select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value as any)}
                        className="habit-inline-select"
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                    </select>

                    <button
                        className={`habit-inline-save-btn ${name.trim() ? 'active' : ''}`}
                        onClick={handleCreate}
                        disabled={!name.trim()}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
