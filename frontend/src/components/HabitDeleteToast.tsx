import React from 'react';
import { useHabitStore } from '../store/habitStore';

export const HabitDeleteToast: React.FC = () => {
    const { lastDeletedHabit, undoDeleteHabit } = useHabitStore();

    if (!lastDeletedHabit) return null;

    return (
        <div className="habit-delete-toast">
            <span className="toast-text">
                Habit "<strong>{lastDeletedHabit.name}</strong>" deleted.
            </span>
            <button className="toast-undo-btn" onClick={undoDeleteHabit}>
                Undo
            </button>
        </div>
    );
};
