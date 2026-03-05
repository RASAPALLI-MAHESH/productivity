import React from 'react';
import { useHabitStore } from '../store/habitStore';
import { useAuthStore } from '../store/authStore';

export const HabitsIntelligenceHeader: React.FC = () => {
    const { intelligence, habits } = useHabitStore();
    const { user } = useAuthStore();

    if (habits.length === 0) return null;

    const currentLevel = user?.level || 1;
    const xp = user?.xp || 0;
    const xpForNext = currentLevel * 1000;
    const xpProgress = Math.min(Math.round((xp / xpForNext) * 100), 100);

    return (
        <div className="intel-header-grid">
            {/* Consistency Module */}
            <div className="intel-module relative overflow-hidden">
                <span className="intel-label text-gray-400 font-medium">Consistency Score</span>
                <div className="intel-value-group mt-1 flex items-baseline gap-1">
                    <span className="intel-value text-3xl font-bold tracking-tight text-white">{intelligence.consistencyScore}</span>
                    <span className="intel-sub text-gray-500 font-medium tracking-wider">/ 100</span>
                </div>
                <div className={`momentum-indicator stable mt-2 flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded w-fit`}>
                    <span className="material-icons text-[14px]">insights</span>
                    <span>30-Day Avg</span>
                </div>
            </div>

            {/* Risk Module */}
            <div className="intel-module relative overflow-hidden">
                <span className="intel-label text-gray-400 font-medium">Risk Threshold</span>
                <div className="intel-value-group mt-1 flex items-baseline gap-1">
                    <span className="intel-value text-3xl font-bold tracking-tight" style={{ color: intelligence.riskCount > 0 ? 'var(--p-error)' : 'var(--p-success)' }}>
                        {intelligence.riskCount}
                    </span>
                    <span className="intel-sub text-gray-500 font-medium tracking-wider">Habits at Risk</span>
                </div>
                <div className="intel-sub text-[11px] mt-2 text-gray-500">
                    {intelligence.riskCount > 0 ? 'Action required to protect streaks' : 'All habits are stable'}
                </div>
            </div>

            {/* Momentum Module (Stability vs Intensity) */}
            <div className="intel-module relative overflow-hidden">
                <span className="intel-label text-gray-400 font-medium">Streak Capacity</span>
                <div className="intel-value-group mt-1 flex items-baseline gap-1">
                    <span className="intel-value text-3xl font-bold tracking-tight text-white">{intelligence.longestStreak}</span>
                    <span className="intel-sub text-gray-500 font-medium tracking-wider">Max Current Streak</span>
                </div>
                <div className="intel-sub text-[11px] mt-2 text-gray-500">
                    Across {habits.length} active pipelines
                </div>
            </div>

            {/* Performance Level Module */}
            <div className="intel-module relative overflow-hidden flex flex-col justify-between">
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="intel-label text-gray-400 font-medium">Elite Rank</span>
                        <span className="intel-sub text-xs" style={{ fontWeight: 800, color: 'var(--p-accent)' }}>LVL {currentLevel}</span>
                    </div>
                </div>
                <div className="mt-auto">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span className="intel-sub text-[10px] uppercase tracking-wider text-gray-500 font-bold">Efficiency Gain</span>
                        <span className="intel-sub text-[10px] uppercase tracking-wider text-white font-bold">{xpProgress}%</span>
                    </div>
                    <div className="level-progress-track relative w-full bg-white/5 rounded-full overflow-hidden" style={{ height: '6px' }}>
                        <div className="level-progress-fill absolute top-0 left-0 h-full rounded-full" style={{ width: `${xpProgress}%`, background: 'var(--p-accent)' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};
