import { memo } from 'react';
import type { Task } from '../types';

interface DeadlineInsightsProps {
    tasks: Task[];
}

export const DeadlineInsights = memo(({ tasks }: DeadlineInsightsProps) => {
    const activeTasks = tasks.filter(t => t.deadline && (t.status === 'todo' || t.status === 'in-progress'));

    // Risk Distribution
    const counts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
    };

    activeTasks.forEach(t => {
        const d = new Date(t.deadline!);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (days < 0) counts.critical++;
        else if (days <= 1) counts.high++;
        else if (days <= 3) counts.medium++;
        else counts.low++;
    });

    // Busy Days (Mock/Calculation for Day of Week)
    const dayCounts: Record<string, number> = { 'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0 };
    activeTasks.forEach(t => {
        const day = new Date(t.deadline!).toLocaleDateString('en-US', { weekday: 'short' });
        dayCounts[day]++;
    });

    return (
        <div className="deadline-insights">
            <h3 className="insights-title">Strategic Insights</h3>

            <div className="insight-section">
                <div className="insight-label">Risk Distribution</div>
                <div className="risk-distribution-bar">
                    <div className="risk-segment critical" style={{ flex: counts.critical || 0.1 }} />
                    <div className="risk-segment high" style={{ flex: counts.high || 0.1 }} />
                    <div className="risk-segment medium" style={{ flex: counts.medium || 0.1 }} />
                    <div className="risk-segment low" style={{ flex: counts.low || 0.1 }} />
                </div>
                <div className="risk-legend">
                    <div className="legend-item"><span className="dot critical" /> {counts.critical}</div>
                    <div className="legend-item"><span className="dot high" /> {counts.high}</div>
                    <div className="legend-item"><span className="dot medium" /> {counts.medium}</div>
                    <div className="legend-item"><span className="dot low" /> {counts.low}</div>
                </div>
            </div>

            <div className="insight-section">
                <div className="insight-label">Workload by Day</div>
                <div className="workload-grid">
                    {Object.entries(dayCounts).map(([day, count]) => (
                        <div key={day} className="day-pillar-group">
                            <div className="day-pillar" style={{ height: `${Math.min(count * 20, 100)}%`, opacity: count > 0 ? 1 : 0.2 }} />
                            <div className="day-label">{day[0]}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="insight-section action-card">
                <div className="insight-label">Advice</div>
                <p className="insight-text">
                    {counts.critical > 0
                        ? `You have ${counts.critical} overdue tasks. Focus on clearing backlog to reduce cognitive load.`
                        : counts.high > 2
                            ? "High workload today. Reschedule non-critical tasks to avoid burnout."
                            : "Your schedule looks balanced for the next 48 hours."}
                </p>
            </div>
        </div>
    );
});
