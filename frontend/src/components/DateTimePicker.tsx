import { useState, useRef, useEffect, useMemo } from 'react';

interface DateTimePickerProps {
    value: string; // ISO string
    onChange: (value: string) => void;
    label?: string;
}

/** Convert 12h hour + ampm to 24h (0-23) */
function to24h(hour12: number, ampm: 'am' | 'pm'): number {
    if (hour12 === 12) return ampm === 'am' ? 0 : 12;
    return ampm === 'pm' ? hour12 + 12 : hour12;
}

/** Get 12h hour (1-12) and ampm from a Date */
function fromDateTo12h(date: Date): { hour12: number; minute: number; ampm: 'am' | 'pm' } {
    const h24 = date.getHours();
    const minute = Math.min(59, Math.max(0, date.getMinutes()));
    const hour12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
    const ampm = h24 >= 12 ? 'pm' : 'am';
    return { hour12, minute, ampm };
}

/** Build a valid ISO string from date + 12h time. Sanitizes all inputs. */
function buildISO(date: Date, hour12: number, minute: number, ampm: 'am' | 'pm'): string {
    const d = new Date(date);
    const h = Math.min(12, Math.max(1, hour12));
    const m = Math.min(59, Math.max(0, minute));
    d.setHours(to24h(h, ampm), m, 0, 0);
    const iso = d.toISOString();
    if (iso === 'Invalid Date' || Number.isNaN(d.getTime())) {
        d.setHours(9, 0, 0, 0);
        return d.toISOString();
    }
    return iso;
}

const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const initial = value ? new Date(value) : null;
    const { hour12: initHour, minute: initMin, ampm: initAmpm } = initial
        ? fromDateTo12h(initial)
        : { hour12: 9, minute: 0, ampm: 'am' as const };

    const [currentDate, setCurrentDate] = useState(initial ? new Date(initial) : new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(initial);
    const [hour12, setHour12] = useState(initHour);
    const [minute, setMinute] = useState(initMin);
    const [ampm, setAmpm] = useState<'am' | 'pm'>(initAmpm);

    // Sync from controlled value
    useEffect(() => {
        if (!value) {
            setSelectedDate(null);
            setHour12(9);
            setMinute(0);
            setAmpm('am');
            return;
        }
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return;
        setSelectedDate(d);
        const { hour12: h, minute: m, ampm: a } = fromDateTo12h(d);
        setHour12(h);
        setMinute(m);
        setAmpm(a);
        setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const commitTime = (baseDate: Date, h: number, m: number, a: 'am' | 'pm') => {
        const iso = buildISO(baseDate, h, m, a);
        onChange(iso);
        setSelectedDate(new Date(iso));
        setHour12(Math.min(12, Math.max(1, h)));
        setMinute(Math.min(59, Math.max(0, m)));
        setAmpm(a);
    };

    const handleDateSelect = (date: Date) => {
        const base = selectedDate ? new Date(selectedDate) : new Date(date);
        base.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        commitTime(base, hour12, minute, ampm);
    };

    const handleTimeChange = (newHour12?: number, newMinute?: number, newAmpm?: 'am' | 'pm') => {
        const h = newHour12 ?? hour12;
        const m = newMinute ?? minute;
        const a = newAmpm ?? ampm;
        const base = selectedDate ? new Date(selectedDate) : new Date();
        if (!selectedDate) setSelectedDate(new Date(base));
        commitTime(base, h, m, a);
    };

    const handleQuickOption = (type: 'today' | 'tomorrow' | 'thisEvening' | 'tomorrowMorning' | 'weekend' | 'nextWeek') => {
        const now = new Date();
        const date = new Date(now);
        let h = 9, m = 0; let a: 'am' | 'pm' = 'am';

        switch (type) {
            case 'today':
                h = 9; m = 0; a = 'am';
                break;
            case 'tomorrow':
                date.setDate(date.getDate() + 1);
                h = 9; m = 0; a = 'am';
                break;
            case 'thisEvening':
                h = 6; m = 0; a = 'pm';
                break;
            case 'tomorrowMorning':
                date.setDate(date.getDate() + 1);
                h = 9; m = 0; a = 'am';
                break;
            case 'weekend': {
                const day = date.getDay();
                const diff = (6 - day + 7) % 7 || 7;
                date.setDate(date.getDate() + diff);
                h = 9; m = 0; a = 'am';
                break;
            }
            case 'nextWeek':
                date.setDate(date.getDate() + 7);
                h = 9; m = 0; a = 'am';
                break;
        }

        commitTime(date, h, m, a);
        setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
        setIsOpen(false);
    };

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days: (Date | null)[] = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    }, [currentDate]);

    const formatDateShort = (date: Date | null) => {
        if (!date) return 'Set deadline';
        const now = new Date();
        if (date.toDateString() === now.toDateString()) return 'Today';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatTimeDisplay = () => {
        const h = hour12 === 12 ? 12 : hour12;
        const m = minute.toString().padStart(2, '0');
        return `${h}:${m} ${ampm.toUpperCase()}`;
    };

    return (
        <div className="datetime-picker-elite" ref={containerRef}>
            <button type="button" className="meta-btn" onClick={() => setIsOpen(!isOpen)}>
                <span className="material-symbols-outlined icon-xs">calendar_today</span>
                <span>{formatDateShort(selectedDate)}</span>
                {selectedDate && <span className="datetime-time-badge">{formatTimeDisplay()}</span>}
            </button>

            {isOpen && (
                <div className="datetime-popover-elite">
                    <div className="popover-left">
                        <button type="button" className="preset-btn" onClick={() => handleQuickOption('today')}>
                            <span className="material-symbols-outlined icon-sm">today</span>
                            <span>Today</span>
                        </button>
                        <button type="button" className="preset-btn" onClick={() => handleQuickOption('tomorrow')}>
                            <span className="material-symbols-outlined icon-sm">event_repeat</span>
                            <span>Tomorrow</span>
                        </button>
                        <button type="button" className="preset-btn" onClick={() => handleQuickOption('thisEvening')}>
                            <span className="material-symbols-outlined icon-sm">dark_mode</span>
                            <span>This evening</span>
                        </button>
                        <button type="button" className="preset-btn" onClick={() => handleQuickOption('tomorrowMorning')}>
                            <span className="material-symbols-outlined icon-sm">wb_sunny</span>
                            <span>Tomorrow morning</span>
                        </button>
                        <button type="button" className="preset-btn" onClick={() => handleQuickOption('weekend')}>
                            <span className="material-symbols-outlined icon-sm">weekend</span>
                            <span>Weekend</span>
                        </button>
                        <button type="button" className="preset-btn" onClick={() => handleQuickOption('nextWeek')}>
                            <span className="material-symbols-outlined icon-sm">next_week</span>
                            <span>Next week</span>
                        </button>
                        <div className="preset-divider" />
                        <button
                            type="button"
                            className="preset-btn clear-btn"
                            onClick={() => { onChange(''); setSelectedDate(null); setHour12(9); setMinute(0); setAmpm('am'); setIsOpen(false); }}
                        >
                            <span className="material-symbols-outlined icon-sm">block</span>
                            <span>No date</span>
                        </button>
                    </div>

                    <div className="popover-right">
                        <div className="calendar-header">
                            <span className="month-year">
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <div className="calendar-nav">
                                <button
                                    type="button"
                                    className="nav-btn"
                                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                                >
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button
                                    type="button"
                                    className="nav-btn"
                                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                                >
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>

                        <div className="calendar-grid">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="weekday">{d}</span>)}
                            {calendarDays.map((date, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className={`day-btn ${!date ? 'empty' : ''} ${date && selectedDate && date.toDateString() === selectedDate.toDateString() ? 'selected' : ''}`}
                                    disabled={!date}
                                    onClick={() => date && handleDateSelect(date)}
                                >
                                    {date?.getDate()}
                                </button>
                            ))}
                        </div>

                        <div className="time-selector time-selector-12h">
                            <span className="material-symbols-outlined icon-sm">schedule</span>
                            <span className="time-label">Time</span>
                            <select
                                className="time-select time-select-hour"
                                value={hour12}
                                onChange={(e) => handleTimeChange(parseInt(e.target.value, 10), undefined, undefined)}
                                aria-label="Hour"
                            >
                                {HOURS_12.map(h => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                            <span className="time-sep">:</span>
                            <select
                                className="time-select time-select-minute"
                                value={minute}
                                onChange={(e) => handleTimeChange(undefined, parseInt(e.target.value, 10), undefined)}
                                aria-label="Minute"
                            >
                                {MINUTES.map(m => (
                                    <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                                ))}
                            </select>
                            <select
                                className="time-select time-select-ampm"
                                value={ampm}
                                onChange={(e) => handleTimeChange(undefined, undefined, e.target.value as 'am' | 'pm')}
                                aria-label="AM/PM"
                            >
                                <option value="am">AM</option>
                                <option value="pm">PM</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
