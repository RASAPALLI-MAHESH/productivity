import { useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { subDays, isSameDay } from 'date-fns';

export function HabitsIntelligenceHeader() {
    const { habits, habitLogs } = useAppStore();
    const { user } = useAuthStore();

    const stats = useMemo(() => {
        if (!habits.length) return { consistency: 0, momentum: 'stable', riskCount: 0, xpProgress: 0, level: 1 };

        const today = new Date();
        const last30Days = Array.from({ length: 30 }, (_, i) => subDays(today, i));

        // 1. Consistency Score (Weighted 30-day Completion %)
        let weightedCompletion = 0;
        let totalWeight = 0;

        habits.forEach(habit => {
            const logs = habitLogs[habit.id] || [];
            last30Days.forEach((date, i) => {
                const weight = (30 - i) / 30; // Recent days have higher weight
                totalWeight += weight;
                if (logs.some(l => isSameDay(new Date(l.date), date) && l.completed)) {
                    weightedCompletion += weight;
                }
            });
        });

        const consistency = habits.length ? Math.round((weightedCompletion / totalWeight) * 100) : 0;

        // 2. Momentum Detection (Last 7 vs Previous 7 days)
        let thisWeekCompletions = 0;
        let lastWeekCompletions = 0;

        habits.forEach(habit => {
            const logs = habitLogs[habit.id] || [];
            logs.forEach(l => {
                const logDate = new Date(l.date);
                if (l.completed) {
                    if (logDate >= subDays(today, 7)) thisWeekCompletions++;
                    else if (logDate >= subDays(today, 14)) lastWeekCompletions++;
                }
            });
        });

        let momentum: 'rising' | 'declining' | 'stable' = 'stable';
        if (thisWeekCompletions > lastWeekCompletions * 1.1) momentum = 'rising';
        else if (thisWeekCompletions < lastWeekCompletions * 0.9) momentum = 'declining';

        // 3. Risk Detection (Streaks about to break - no completion today or yesterday for daily)
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = subDays(today, 1).toISOString().split('T')[0];

        const riskCount = habits.filter(h =>
            h.frequency === 'daily' &&
            h.currentStreak > 0 &&
            h.lastCompletedDate !== todayStr &&
            h.lastCompletedDate !== yesterdayStr
        ).length;

        // 4. XP Progress (Placeholder if user.xp/level not yet dynamic)
        const currentLevel = user?.level || 1;
        const xp = user?.xp || 0;
        const xpForNext = currentLevel * 1000;
        const xpProgress = Math.min(Math.round((xp / xpForNext) * 100), 100);

        return { consistency, momentum, riskCount, xpProgress, level: currentLevel };
    }, [habits, habitLogs, user]);

    return (
        <div className="intel-header-grid">
            {/* Consistency Module */}
            <div className="intel-module">
                <span className="intel-label">Consistency Score</span>
                <div className="intel-value-group">
                    <span className="intel-value">{stats.consistency}</span>
                    <span className="intel-sub">/ 100</span>
                </div>
                <div className={`momentum-indicator ${stats.momentum}`}>
                    <span className="material-symbols-outlined icon-sm">
                        {stats.momentum === 'rising' ? 'trending_up' : stats.momentum === 'declining' ? 'trending_down' : 'trending_flat'}
                    </span>
                    <span style={{ textTransform: 'capitalize' }}>Momentum {stats.momentum}</span>
                </div>
            </div>

            {/* Risk Module */}
            <div className="intel-module">
                <span className="intel-label">Risk Threshold</span>
                <div className="intel-value-group">
                    <span className="intel-value" style={{ color: stats.riskCount > 0 ? 'var(--p-error)' : 'var(--p-success)' }}>
                        {stats.riskCount}
                    </span>
                    <span className="intel-sub">Habits at Risk</span>
                </div>
                <div className="intel-sub" style={{ fontSize: '11px', marginTop: '4px' }}>
                    {stats.riskCount > 0 ? 'Action required to protect streaks' : 'All habits are stable'}
                </div>
            </div>

            {/* Momentum Module (Stability vs Intensity) */}
            <div className="intel-module">
                <span className="intel-label">Streak Capacity</span>
                <div className="intel-value-group">
                    <span className="intel-value">{habits.length > 0 ? Math.max(...habits.map(h => h.currentStreak)) : 0}</span>
                    <span className="intel-sub">Max Current Streak</span>
                </div>
                <div className="intel-sub" style={{ fontSize: '11px', marginTop: '4px' }}>
                    {habits.length} active behavioral pipelines
                </div>
            </div>

            {/* Performance Level Module */}
            <div className="intel-module">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="intel-label">Elite Rank</span>
                    <span className="intel-sub" style={{ fontWeight: 800, color: 'var(--p-accent)' }}>LVL {stats.level}</span>
                </div>
                <div className="level-progress-track" style={{ height: '6px', marginTop: '8px' }}>
                    <div className="level-progress-fill" style={{ width: `${stats.xpProgress}%`, background: 'var(--p-accent)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span className="intel-sub" style={{ fontSize: '11px' }}>Efficiency Gain</span>
                    <span className="intel-sub" style={{ fontSize: '11px', fontWeight: 700 }}>{stats.xpProgress}%</span>
                </div>
            </div>
        </div>
    );
}
