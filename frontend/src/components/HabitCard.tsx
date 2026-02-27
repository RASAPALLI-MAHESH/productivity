import { memo, useMemo, useState } from 'react';
import { format, subDays, isSameDay, startOfWeek, addDays } from 'date-fns';
import { Habit, HabitLog } from '../types';

interface HabitCardProps {
    habit: Habit;
    logs: HabitLog[];
    isActive?: boolean;
    onComplete: (id: string) => void;
    onDelete: (id: string) => void;
    onToggleAnalytics: (id: string) => void;
}

export const HabitCard = memo(({ habit, logs, isActive, onComplete, onDelete, onToggleAnalytics }: HabitCardProps) => {
    const [isXpFloating, setIsXpFloating] = useState(false);

    const {
        completedToday,
        isAtRisk,
        sparklineData,
        weekData,
        completionRate
    } = useMemo(() => {
        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');
        const doneToday = logs.some(l => l.date === todayStr && l.completed);

        // Risk detection: Daily habit missed for 1+ day
        const isRisk = habit.frequency === 'daily' &&
            habit.currentStreak > 0 &&
            habit.lastCompletedDate !== todayStr &&
            habit.lastCompletedDate !== format(subDays(today, 1), 'yyyy-MM-dd');

        // Weekday Tracker Data
        const start = startOfWeek(today, { weekStartsOn: 1 });
        const days = Array.from({ length: 7 }, (_, i) => {
            const date = addDays(start, i);
            const dateStr = format(date, 'yyyy-MM-dd');
            return {
                label: format(date, 'EEEEE'), // M, T, W...
                completed: logs.some(l => l.date === dateStr && l.completed),
                isToday: isSameDay(date, today)
            };
        });

        // Sparkline Data (Last 14 days)
        const sparkline = Array.from({ length: 14 }, (_, i) => {
            const dateStr = format(subDays(today, 13 - i), 'yyyy-MM-dd');
            return logs.some(l => l.date === dateStr && l.completed) ? 1 : 0;
        });

        // Weekly Completion Rate
        const thisWeekLogs = logs.filter(l => new Date(l.date) >= start && l.completed);
        const rate = Math.round((thisWeekLogs.length / 7) * 100);

        return { completedToday: doneToday, isAtRisk: isRisk, sparklineData: sparkline, weekData: days, completionRate: rate };
    }, [habit, logs]);

    const handleComplete = () => {
        if (!completedToday) {
            onComplete(habit.id);
            setIsXpFloating(true);
            setTimeout(() => setIsXpFloating(false), 800);
        }
    };

    return (
        <div className={`habit-card-prod ${isActive ? 'active-kbd' : ''}`}>
            {isAtRisk && <div className="risk-alert-p">Critical Risk</div>}

            <div className="habit-top-prod">
                <div className="habit-info-prod">
                    <div className="habit-category-tag">
                        <span className={`category-dot ${habit.category}`} />
                        {habit.category}
                    </div>
                    <h3 className="habit-name-prod">{habit.name}</h3>
                </div>
                <div className="habit-streak-badge">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>local_fire_department</span>
                    {habit.currentStreak}
                </div>
            </div>

            <div className="habit-stats-strip">
                <div className="stat-item-p">
                    <span className="label">Week Avg</span>
                    <span className="value">{completionRate}%</span>
                </div>
                <div className="stat-item-p">
                    <span className="label">14D Trend</span>
                    <div className="sparkline-container">
                        <svg viewBox="0 0 140 30" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                            <path
                                d={`M ${sparklineData.map((v, i) => `${i * 10},${30 - v * 25}`).join(' L ')}`}
                                fill="none"
                                stroke="var(--p-accent)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter="drop-shadow(0 4px 6px rgba(63, 140, 255, 0.4))"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="weekday-row-p">
                {weekData.map((day, idx) => (
                    <div
                        key={idx}
                        className={`wd-day-p ${day.completed ? 'completed' : ''} ${day.isToday ? 'today' : ''}`}
                        title={day.label}
                    >
                        {day.label}
                    </div>
                ))}
            </div>

            <div className="card-actions-p">
                <button
                    className={`btn-complete-p ${completedToday ? 'done' : ''}`}
                    onClick={handleComplete}
                    disabled={completedToday}
                >
                    <span className="material-symbols-outlined">
                        {completedToday ? 'check_circle' : 'bolt'}
                    </span>
                    {completedToday ? 'Secured' : 'Complete Entry'}
                </button>
                <button className="btn-elite" style={{ width: '40px', padding: 0 }} onClick={() => onToggleAnalytics(habit.id)}>
                    <span className="material-symbols-outlined">insights</span>
                </button>
                <button className="btn-elite" style={{ width: '40px', padding: 0, border: 'none', background: 'transparent' }} onClick={() => onDelete(habit.id)}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--p-error)' }}>delete</span>
                </button>
            </div>

            {isXpFloating && <div className="xp-float-elite" style={{ top: '20px', right: '20px' }}>+25 XP</div>}
        </div>
    );
});

HabitCard.displayName = 'HabitCard';
