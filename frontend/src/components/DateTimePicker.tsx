import { useState, useRef, useEffect, useMemo } from 'react';

interface DateTimePickerProps {
    value: string; // ISO string
    onChange: (value: string) => void;
    label?: string;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
    const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
    const [time, setTime] = useState(value ? new Date(value).toTimeString().slice(0, 5) : '09:00');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleDateSelect = (date: Date) => {
        const newDate = new Date(date);
        const [hours, minutes] = time.split(':');
        newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        setSelectedDate(newDate);
        onChange(newDate.toISOString());
    };

    const handleTimeChange = (newTime: string) => {
        setTime(newTime);
        if (selectedDate) {
            const newDate = new Date(selectedDate);
            const [hours, minutes] = newTime.split(':');
            newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            setSelectedDate(newDate);
            onChange(newDate.toISOString());
        }
    };

    const handleQuickOption = (type: 'today' | 'tomorrow' | 'weekend' | 'nextWeek') => {
        const date = new Date();
        if (type === 'tomorrow') date.setDate(date.getDate() + 1);
        if (type === 'weekend') {
            const day = date.getDay();
            const diff = (6 - day + 7) % 7 || 7;
            date.setDate(date.getDate() + diff);
        }
        if (type === 'nextWeek') date.setDate(date.getDate() + 7);

        handleDateSelect(date);
        setIsOpen(false);
    };

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
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

    return (
        <div className="datetime-picker-elite" ref={containerRef}>
            <button className="meta-btn" onClick={() => setIsOpen(!isOpen)}>
                <span className="material-symbols-outlined icon-xs">calendar_today</span>
                <span>{formatDateShort(selectedDate)}</span>
            </button>

            {isOpen && (
                <div className="datetime-popover-elite">
                    <div className="popover-left">
                        <button className="preset-btn" onClick={() => handleQuickOption('today')}>
                            <span className="material-symbols-outlined icon-sm">today</span>
                            <span>Today</span>
                        </button>
                        <button className="preset-btn" onClick={() => handleQuickOption('tomorrow')}>
                            <span className="material-symbols-outlined icon-sm">event_repeat</span>
                            <span>Tomorrow</span>
                        </button>
                        <button className="preset-btn" onClick={() => handleQuickOption('weekend')}>
                            <span className="material-symbols-outlined icon-sm">weekend</span>
                            <span>Weekend</span>
                        </button>
                        <button className="preset-btn" onClick={() => handleQuickOption('nextWeek')}>
                            <span className="material-symbols-outlined icon-sm">next_week</span>
                            <span>Next Week</span>
                        </button>
                        <div className="preset-divider" />
                        <button className="preset-btn clear-btn" onClick={() => { onChange(''); setSelectedDate(null); setIsOpen(false); }}>
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
                                <button className="nav-btn" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button className="nav-btn" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>

                        <div className="calendar-grid">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="weekday">{d}</span>)}
                            {calendarDays.map((date, i) => (
                                <button
                                    key={i}
                                    className={`day-btn ${!date ? 'empty' : ''} ${date?.toDateString() === selectedDate?.toDateString() ? 'selected' : ''}`}
                                    disabled={!date}
                                    onClick={() => date && handleDateSelect(date)}
                                >
                                    {date?.getDate()}
                                </button>
                            ))}
                        </div>

                        <div className="time-selector">
                            <span className="material-symbols-outlined icon-sm">schedule</span>
                            <input
                                type="time"
                                className="time-input"
                                value={time}
                                onChange={(e) => handleTimeChange(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
