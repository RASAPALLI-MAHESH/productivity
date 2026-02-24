import { useMemo } from 'react';
import { Habit, HabitLog } from '../types';
import { subDays, format, isSameDay, startOfWeek, addDays } from 'date-fns';

interface HabitAnalyticsProps {
    habit: Habit | null;
    logs: HabitLog[];
    onClose: () => void;
}

export function HabitAnalytics({ habit, logs, onClose }: HabitAnalyticsProps) {
    if (!habit) return null;

    const insights = useMemo(() => {
        const today = new Date();
        const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });

        // 1. Consistency Matrix (Last 28 Days)
        const heatmap = [];
        for (let w = 3; w >= 0; w--) {
            const weekStart = subDays(startOfThisWeek, w * 7);
            const weekDays = [];
            for (let d = 0; d < 7; d++) {
                const day = addDays(weekStart, d);
                const dateStr = format(day, 'yyyy-MM-dd');
                const isCompleted = logs.some(l => l.date === dateStr && l.completed);
                weekDays.push({ date: day, completed: isCompleted });
            }
            heatmap.push(weekDays);
        }

        // 2. Pattern Analysis
        const dayCounts: Record<string, number> = {};
        logs.forEach(l => {
            if (l.completed) {
                const dayName = format(new Date(l.date), 'EEEE');
                dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
            }
        });
        const bestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        // 3. Momentum & Reliability
        const last30Days = Array.from({ length: 30 }, (_, i) => subDays(today, i));
        const completedCount = logs.filter(l =>
            last30Days.some(d => isSameDay(new Date(l.date), d)) && l.completed
        ).length;
        const reliability = Math.round((completedCount / 30) * 100);

        // 4. AI-Style Summary
        let summary = "Maintaining stable behavioral baseline.";
        if (habit.currentStreak > habit.longestStreak * 0.8) summary = "Approaching personal record peak performance.";
        if (reliability > 90) summary = "Exceptional consistency. Behavior is now foundational.";
        else if (reliability < 30) summary = "Detected friction in routine. Recommend environment adjustment.";

        return { heatmap, bestDay, reliability, summary };
    }, [habit, logs]);

    return (
        <div className="analytics-drawer-elite">
            <div className="drawer-overlay-p" onClick={onClose} />
            <div className="drawer-content-p">
                <div className="drawer-header-p">
                    <div className="habit-title-group-p">
                        <span className={`cat-dot ${habit.category}`} />
                        <h2 className="drawer-title-p">{habit.name}</h2>
                        <p className="drawer-sub-p">Behavioral Telemetry</p>
                    </div>
                    <button className="btn-close-p" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="drawer-body-p">
                    {/* Executive Summary Section */}
                    <div className="insight-section-p">
                        <div className="ai-summary-card-p">
                            <span className="material-symbols-outlined ai-icon">psychology</span>
                            <div className="ai-text-group">
                                <span className="label">Performance Insight</span>
                                <p className="summary">{insights.summary}</p>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="metrics-grid-p">
                        <div className="metric-tile-p">
                            <span className="label">Reliability</span>
                            <div className="value-group">
                                <span className="value">{insights.reliability}%</span>
                                <div className="trend-bar-mini">
                                    <div className="fill" style={{ width: `${insights.reliability}%` }} />
                                </div>
                            </div>
                        </div>
                        <div className="metric-tile-p">
                            <span className="label">Peak Day</span>
                            <span className="value-text">{insights.bestDay}</span>
                        </div>
                    </div>

                    {/* 28-Day Visualization */}
                    <div className="insight-section-p">
                        <h4 className="section-label-p">28-Day Consistency Matrix</h4>
                        <div className="heatmap-container-p">
                            <div className="heatmap-matrix-p">
                                {insights.heatmap.map((week, wIdx) => (
                                    <div key={wIdx} className="heatmap-week-p">
                                        {week.map((day, dIdx) => (
                                            <div
                                                key={dIdx}
                                                className={`heatmap-cell-p ${day.completed ? 'filled' : ''}`}
                                                title={format(day.date, 'MMM d, yyyy')}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div className="heatmap-labels-p">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <span key={d}>{d}</span>)}
                            </div>
                        </div>
                    </div>

                    {/* Progression Info */}
                    <div className="progression-banner-p">
                        <div className="banner-top-p">
                            <span className="material-symbols-outlined">auto_awesome</span>
                            <span>Level 12 Architect</span>
                        </div>
                        <div className="progress-p">
                            <div className="progress-fill-p" style={{ width: '68%' }} />
                        </div>
                        <div className="banner-bottom-p">
                            <span>840 XP Gained</span>
                            <span>Next: Mastery Rank</span>
                        </div>
                    </div>
                </div>

                <div className="drawer-footer-p">
                    <button className="btn-full-p" onClick={onClose}>Close Intelligence Panel</button>
                </div>
            </div>
        </div>
    );
}
