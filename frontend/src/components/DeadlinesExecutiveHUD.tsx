import { memo } from 'react';
import type { Task } from '../types';

interface DeadlinesExecutiveHUDProps {
    tasks: Task[];
}

export const DeadlinesExecutiveHUD = memo(({ tasks }: DeadlinesExecutiveHUDProps) => {
    const tasksWithDeadlines = tasks.filter(t => t.deadline && t.status !== 'done');
    const completedTasksWithDeadlines = tasks.filter(t => t.deadline && t.status === 'done');

    const overdueCount = tasksWithDeadlines.filter(t => new Date(t.deadline!) < new Date(new Date().setHours(0, 0, 0, 0))).length;
    const dueTodayCount = tasksWithDeadlines.filter(t => {
        const d = new Date(t.deadline!);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    }).length;

    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    const thisWeekCount = tasksWithDeadlines.filter(t => {
        const d = new Date(t.deadline!);
        return d <= next7Days;
    }).length;

    const totalWithDeadlines = tasksWithDeadlines.length + completedTasksWithDeadlines.length;
    const completionRate = totalWithDeadlines > 0
        ? Math.round((completedTasksWithDeadlines.length / totalWithDeadlines) * 100)
        : 0;

    return (
        <div className="deadlines-executive-hud habits-executive-hud">
            <div className="hud-metric">
                <div className="hud-icon overdue">
                    <span className="material-symbols-outlined">error</span>
                </div>
                <div className="hud-info">
                    <div className="hud-value">{overdueCount}</div>
                    <div className="hud-label">Overdue</div>
                </div>
            </div>

            <div className="hud-divider" />

            <div className="hud-metric">
                <div className="hud-icon today">
                    <span className="material-symbols-outlined">bolt</span>
                </div>
                <div className="hud-info">
                    <div className="hud-value">{dueTodayCount}</div>
                    <div className="hud-label">Due Today</div>
                </div>
            </div>

            <div className="hud-divider" />

            <div className="hud-metric">
                <div className="hud-icon week">
                    <span className="material-symbols-outlined">calendar_today</span>
                </div>
                <div className="hud-info">
                    <div className="hud-value">{thisWeekCount}</div>
                    <div className="hud-label">This Week</div>
                </div>
            </div>

            <div className="hud-divider" />

            <div className="hud-metric">
                <div className="hud-icon performance">
                    <span className="material-symbols-outlined">analytics</span>
                </div>
                <div className="hud-info">
                    <div className="hud-value">{completionRate}%</div>
                    <div className="hud-label">Completion</div>
                </div>
            </div>
        </div>
    );
});
