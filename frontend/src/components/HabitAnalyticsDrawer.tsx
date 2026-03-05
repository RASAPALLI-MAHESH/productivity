import React, { useMemo } from 'react';
import { useHabitStore } from '../store/habitStore';

interface HabitAnalyticsDrawerProps {
    habitId: string;
    onClose: () => void;
}

export const HabitAnalyticsDrawer: React.FC<HabitAnalyticsDrawerProps> = ({ habitId, onClose }) => {
    const { habits, habitLogs } = useHabitStore();
    const habit = habits.find(h => h.id === habitId);

    const logs = habitLogs[habitId] || [];

    const matrix = useMemo(() => {
        const today = new Date();
        const days = [];
        let completedCount = 0;

        for (let i = 27; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const isCompleted = logs.some(l => l.date === dateStr && l.completed);

            if (isCompleted) completedCount++;
            days.push({ date: dateStr, completed: isCompleted });
        }
        return { days, completionRate: Math.round((completedCount / 28) * 100) };
    }, [logs]);

    if (!habit) return null;

    return (
        <div className="habit-analytics-drawer-overlay" onClick={onClose}>
            <div className="habit-analytics-drawer" onClick={e => e.stopPropagation()}>
                <div className="drawer-header">
                    <h2>{habit.name} <span className="drawer-category">{habit.category}</span></h2>
                    <button className="drawer-close" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="drawer-content">
                    <div className="drawer-intel-grid">
                        <div className="drawer-intel-card">
                            <div className="drawer-intel-value">{habit.currentStreak}</div>
                            <div className="drawer-intel-label">Current Streak</div>
                        </div>
                        <div className="drawer-intel-card">
                            <div className="drawer-intel-value">{habit.longestStreak}</div>
                            <div className="drawer-intel-label">Longest Streak</div>
                        </div>
                        <div className="drawer-intel-card accent">
                            <div className="drawer-intel-value">{matrix.completionRate}%</div>
                            <div className="drawer-intel-label">28-Day Rate</div>
                        </div>
                    </div>

                    <div className="drawer-section">
                        <h3>28-Day Heatmap</h3>
                        <div className="heatmap-grid">
                            {matrix.days.map((day) => (
                                <div
                                    key={day.date}
                                    className={`heatmap-cell ${day.completed ? 'completed' : ''}`}
                                    title={day.date}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="drawer-section insight-box">
                        <span className="material-symbols-outlined">auto_awesome</span>
                        <p>
                            {habit.currentStreak >= 5
                                ? "Excellent momentum! You're building a solid behavioral pipeline."
                                : habit.currentStreak === 0
                                    ? "Consistency is key. Focus on showing up today no matter what."
                                    : "Keep it going. The hardest part is maintaining the chain."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
