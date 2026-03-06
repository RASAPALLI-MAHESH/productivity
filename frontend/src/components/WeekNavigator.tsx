import { memo } from 'react';

interface WeekNavigatorProps {
    weekStart: Date;
    onPrevWeek: () => void;
    onNextWeek: () => void;
    onToday: () => void;
    viewMode: 'week' | 'month';
    onViewModeChange: (mode: 'week' | 'month') => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeekNavigator = memo(({ weekStart, onPrevWeek, onNextWeek, onToday, viewMode, onViewModeChange }: WeekNavigatorProps) => {
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
    });
    const today = new Date();
    const todayStr = today.toDateString();

    return (
        <div className="week-navigator">
            <div className="week-navigator__controls">
                <button type="button" className="week-navigator__btn" onClick={onPrevWeek} aria-label="Previous week">
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button type="button" className="week-navigator__today" onClick={onToday}>
                    Today
                </button>
                <button type="button" className="week-navigator__btn" onClick={onNextWeek} aria-label="Next week">
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
            <div className="week-navigator__strip">
                {weekDays.map((d) => (
                    <div
                        key={d.toISOString()}
                        className={`week-navigator__day ${d.toDateString() === todayStr ? 'today' : ''}`}
                    >
                        <span className="week-navigator__day-name">{WEEKDAYS[d.getDay()]}</span>
                        <span className="week-navigator__day-num">{d.getDate()}</span>
                    </div>
                ))}
            </div>
            <div className="week-navigator__view-toggle">
                <button
                    type="button"
                    className={viewMode === 'week' ? 'active' : ''}
                    onClick={() => onViewModeChange('week')}
                >
                    Week
                </button>
                <button
                    type="button"
                    className={viewMode === 'month' ? 'active' : ''}
                    onClick={() => onViewModeChange('month')}
                >
                    Month
                </button>
            </div>
        </div>
    );
});
