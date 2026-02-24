import { useMemo } from 'react';
import { useAppStore } from '../store/appStore';

export function HabitsExecutiveHUD() {
    const { habits, habitLogs } = useAppStore();

    const stats = useMemo(() => {
        const activeHabits = habits.length;
        if (activeHabits === 0) return { streak: 0, completion: 0, active: 0, level: 12 };

        // Global streak (max of all habits)
        const maxStreak = Math.max(...habits.map(h => h.currentStreak), 0);

        // Weekly completion (last 7 days)
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            return d.toISOString().split('T')[0];
        });

        let totalEligible = activeHabits * 7;
        let totalCompleted = 0;

        habits.forEach(habit => {
            const logs = habitLogs[habit.id] || [];
            last7Days.forEach(date => {
                if (logs.some(l => l.date === date && l.completed)) {
                    totalCompleted++;
                }
            });
        });

        const weeklyCompletion = Math.round((totalCompleted / totalEligible) * 100);

        return {
            streak: maxStreak,
            completion: weeklyCompletion,
            active: activeHabits,
            level: 12 // Placeholder for now, could be derived from User model
        };
    }, [habits, habitLogs]);

    return (
        <div className="habits-executive-hud">
            <div className="hud-metric">
                <span className="material-symbols-outlined hud-icon flame">local_fire_department</span>
                <span className="hud-value">{stats.streak}</span>
                <span className="hud-label">Day Streak</span>
            </div>
            <div className="hud-divider" />
            <div className="hud-metric">
                <span className="material-symbols-outlined hud-icon completion">analytics</span>
                <span className="hud-value">{stats.completion}%</span>
                <span className="hud-label">Weekly Completion</span>
            </div>
            <div className="hud-divider" />
            <div className="hud-metric">
                <span className="material-symbols-outlined hud-icon active">view_agenda</span>
                <span className="hud-value">{stats.active}</span>
                <span className="hud-label">Active Habits</span>
            </div>
            <div className="hud-divider" />
            <div className="hud-metric">
                <div className="level-badge-tiny">
                    <span className="level-text">LVL</span>
                    <span className="level-number">{stats.level}</span>
                </div>
                <div className="level-progress-group">
                    <div className="level-progress-track">
                        <div className="level-progress-fill" style={{ width: '65%' }} />
                    </div>
                    <span className="hud-label">Performance Level</span>
                </div>
            </div>
        </div>
    );
}
