/**
 * Todoist-style Natural Language Task Parser
 * 
 * Converts a single input string into structured task data.
 * 
 * @example
 * parseTask("Design dashboard tomorrow 6pm #productiv @design p1 !30m")
 * // Returns:
 * // {
 * //   title: "Design dashboard",
 * //   dueDate: "2026-03-12",
 * //   dueTime: "18:00",
 * //   project: "productiv",
 * //   labels: ["design"],
 * //   priority: 1,
 * //   reminder: "30m before",
 * //   recurring: null
 * // }
 */

export interface ParsedTask {
    title: string;
    dueDate: string | null;
    dueTime: string | null;
    project: string | null;
    labels: string[];
    priority: number | null;
    reminder: string | null;
    recurring: string | null;
}

// Day name mapping
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_NAMES_SHORT = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// Month name mapping
const MONTH_NAMES = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
];
const MONTH_NAMES_SHORT = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/**
 * Format a Date object to YYYY-MM-DD string
 */
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format time to HH:mm string
 */
function formatTime(hours: number, minutes: number = 0): string {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Get the next occurrence of a weekday
 */
function getNextWeekday(dayIndex: number, isNext: boolean = false): Date {
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntil = dayIndex - currentDay;
    
    if (daysUntil <= 0 || isNext) {
        daysUntil += 7;
    }
    if (isNext && daysUntil <= 7) {
        daysUntil += 7;
    }
    
    const result = new Date(today);
    result.setDate(today.getDate() + daysUntil);
    return result;
}

/**
 * Parse project from input (#projectName)
 */
function parseProject(input: string): { project: string | null; remaining: string } {
    const projectRegex = /#(\w+)/g;
    let project: string | null = null;
    let remaining = input;
    
    const match = projectRegex.exec(input);
    if (match) {
        project = match[1];
        remaining = input.replace(match[0], '').trim();
    }
    
    return { project, remaining };
}

/**
 * Parse labels from input (@labelName)
 */
function parseLabels(input: string): { labels: string[]; remaining: string } {
    const labelRegex = /@(\w+)/g;
    const labels: string[] = [];
    let remaining = input;
    let match;
    
    while ((match = labelRegex.exec(input)) !== null) {
        labels.push(match[1]);
    }
    
    remaining = input.replace(/@\w+/g, '').trim();
    return { labels, remaining };
}

/**
 * Parse priority from input (p1, p2, p3, p4)
 */
function parsePriority(input: string): { priority: number | null; remaining: string } {
    const priorityRegex = /\bp([1-4])\b/i;
    let priority: number | null = null;
    let remaining = input;
    
    const match = priorityRegex.exec(input);
    if (match) {
        priority = parseInt(match[1], 10);
        remaining = input.replace(match[0], '').trim();
    }
    
    return { priority, remaining };
}

/**
 * Parse reminder from input (!10m, !30m, !1h, !1d)
 */
function parseReminder(input: string): { reminder: string | null; remaining: string } {
    const reminderRegex = /!(\d+)(m|min|h|hr|hour|d|day)s?\b/i;
    let reminder: string | null = null;
    let remaining = input;
    
    const match = reminderRegex.exec(input);
    if (match) {
        const value = match[1];
        const unit = match[2].toLowerCase();
        
        let unitLabel = '';
        if (unit.startsWith('m')) unitLabel = 'm';
        else if (unit.startsWith('h')) unitLabel = 'h';
        else if (unit.startsWith('d')) unitLabel = 'd';
        
        reminder = `${value}${unitLabel} before`;
        remaining = input.replace(match[0], '').trim();
    }
    
    return { reminder, remaining };
}

/**
 * Parse recurring pattern from input
 * Supports: every day, every monday, every 3 days, every week, every month
 */
function parseRecurring(input: string): { recurring: string | null; remaining: string } {
    const patterns = [
        // every day
        { regex: /\bevery\s+day\b/i, value: 'every day' },
        // every week
        { regex: /\bevery\s+week\b/i, value: 'every week' },
        // every month
        { regex: /\bevery\s+month\b/i, value: 'every month' },
        // every year
        { regex: /\bevery\s+year\b/i, value: 'every year' },
        // every X days/weeks/months
        { regex: /\bevery\s+(\d+)\s+(day|week|month|year)s?\b/i, value: null },
        // every weekday (every monday, every tuesday, etc.)
        { regex: /\bevery\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/i, value: null },
        // every weekday
        { regex: /\bevery\s+weekday\b/i, value: 'every weekday' },
    ];
    
    let recurring: string | null = null;
    let remaining = input;
    
    for (const pattern of patterns) {
        const match = pattern.regex.exec(input);
        if (match) {
            if (pattern.value) {
                recurring = pattern.value;
            } else if (match[1] && match[2]) {
                // every X days/weeks/months
                recurring = `every ${match[1]} ${match[2]}${parseInt(match[1]) > 1 ? 's' : ''}`;
            } else if (match[1]) {
                // every monday, etc.
                recurring = `every ${match[1].toLowerCase()}`;
            }
            remaining = input.replace(match[0], '').trim();
            break;
        }
    }
    
    return { recurring, remaining };
}

/**
 * Parse time from input
 * Supports: 6pm, 6:30pm, 18:00, at 7, at 7pm
 */
function parseTime(input: string): { time: string | null; remaining: string } {
    const patterns = [
        // 6:30pm, 6:30 pm, 18:30
        { regex: /\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/i },
        // 6pm, 6 pm, 6am
        { regex: /\b(\d{1,2})\s*(am|pm)\b/i },
        // at 7, at 7pm, at 7:30pm
        { regex: /\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i },
    ];
    
    let time: string | null = null;
    let remaining = input;
    
    for (const pattern of patterns) {
        const match = pattern.regex.exec(input);
        if (match) {
            let hours = parseInt(match[1], 10);
            let minutes = match[2] ? parseInt(match[2], 10) : 0;
            const meridiem = match[3]?.toLowerCase() || match[2]?.toLowerCase();
            
            // Handle AM/PM
            if (meridiem === 'pm' && hours < 12) {
                hours += 12;
            } else if (meridiem === 'am' && hours === 12) {
                hours = 0;
            }
            
            // Validate time
            if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
                time = formatTime(hours, minutes);
                remaining = input.replace(match[0], '').trim();
            }
            break;
        }
    }
    
    return { time, remaining };
}

/**
 * Parse date from input
 * Supports: today, tomorrow, tonight, monday, next monday, in X days, in X weeks, 25 june
 */
function parseDate(input: string): { date: string | null; time: string | null; remaining: string } {
    const today = new Date();
    let date: string | null = null;
    let time: string | null = null;
    let remaining = input;
    
    const patterns: { regex: RegExp; handler: (match: RegExpExecArray) => { date: Date | null; time?: string } }[] = [
        // today
        {
            regex: /\btoday\b/i,
            handler: () => ({ date: today })
        },
        // tomorrow
        {
            regex: /\btomorrow\b/i,
            handler: () => {
                const d = new Date(today);
                d.setDate(d.getDate() + 1);
                return { date: d };
            }
        },
        // tonight (today at 21:00)
        {
            regex: /\btonight\b/i,
            handler: () => ({ date: today, time: '21:00' })
        },
        // next week
        {
            regex: /\bnext\s+week\b/i,
            handler: () => {
                const d = new Date(today);
                d.setDate(d.getDate() + 7);
                return { date: d };
            }
        },
        // next month
        {
            regex: /\bnext\s+month\b/i,
            handler: () => {
                const d = new Date(today);
                d.setMonth(d.getMonth() + 1);
                return { date: d };
            }
        },
        // next monday, next tuesday, etc.
        {
            regex: /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/i,
            handler: (match) => {
                const dayName = match[1].toLowerCase();
                let dayIndex = DAY_NAMES.indexOf(dayName);
                if (dayIndex === -1) {
                    dayIndex = DAY_NAMES_SHORT.indexOf(dayName.substring(0, 3));
                }
                return { date: getNextWeekday(dayIndex, true) };
            }
        },
        // monday, tuesday, etc. (this or next)
        {
            regex: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/i,
            handler: (match) => {
                const dayName = match[1].toLowerCase();
                let dayIndex = DAY_NAMES.indexOf(dayName);
                if (dayIndex === -1) {
                    dayIndex = DAY_NAMES_SHORT.indexOf(dayName.substring(0, 3));
                }
                return { date: getNextWeekday(dayIndex, false) };
            }
        },
        // in X days
        {
            regex: /\bin\s+(\d+)\s+days?\b/i,
            handler: (match) => {
                const days = parseInt(match[1], 10);
                const d = new Date(today);
                d.setDate(d.getDate() + days);
                return { date: d };
            }
        },
        // in X weeks
        {
            regex: /\bin\s+(\d+)\s+weeks?\b/i,
            handler: (match) => {
                const weeks = parseInt(match[1], 10);
                const d = new Date(today);
                d.setDate(d.getDate() + weeks * 7);
                return { date: d };
            }
        },
        // in X months
        {
            regex: /\bin\s+(\d+)\s+months?\b/i,
            handler: (match) => {
                const months = parseInt(match[1], 10);
                const d = new Date(today);
                d.setMonth(d.getMonth() + months);
                return { date: d };
            }
        },
        // 25 june, 25 jun, june 25, jun 25
        {
            regex: /\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i,
            handler: (match) => {
                const day = parseInt(match[1], 10);
                const monthName = match[2].toLowerCase();
                let monthIndex = MONTH_NAMES.indexOf(monthName);
                if (monthIndex === -1) {
                    monthIndex = MONTH_NAMES_SHORT.indexOf(monthName.substring(0, 3));
                }
                const d = new Date(today.getFullYear(), monthIndex, day);
                // If the date has passed this year, use next year
                if (d < today) {
                    d.setFullYear(d.getFullYear() + 1);
                }
                return { date: d };
            }
        },
        // june 25, jun 25
        {
            regex: /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})\b/i,
            handler: (match) => {
                const monthName = match[1].toLowerCase();
                const day = parseInt(match[2], 10);
                let monthIndex = MONTH_NAMES.indexOf(monthName);
                if (monthIndex === -1) {
                    monthIndex = MONTH_NAMES_SHORT.indexOf(monthName.substring(0, 3));
                }
                const d = new Date(today.getFullYear(), monthIndex, day);
                // If the date has passed this year, use next year
                if (d < today) {
                    d.setFullYear(d.getFullYear() + 1);
                }
                return { date: d };
            }
        },
        // DD/MM or MM/DD format (assume DD/MM for international)
        {
            regex: /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/,
            handler: (match) => {
                const first = parseInt(match[1], 10);
                const second = parseInt(match[2], 10);
                let year = match[3] ? parseInt(match[3], 10) : today.getFullYear();
                
                // Assume DD/MM format
                let day = first;
                let month = second - 1;
                
                // If first number > 12, it must be DD/MM
                // If second number > 12, it must be MM/DD
                if (second > 12) {
                    day = second;
                    month = first - 1;
                }
                
                if (year < 100) {
                    year += 2000;
                }
                
                const d = new Date(year, month, day);
                return { date: d };
            }
        },
    ];
    
    for (const pattern of patterns) {
        const match = pattern.regex.exec(remaining);
        if (match) {
            const result = pattern.handler(match);
            if (result.date) {
                date = formatDate(result.date);
                if (result.time) {
                    time = result.time;
                }
                remaining = remaining.replace(match[0], '').trim();
            }
            break;
        }
    }
    
    return { date, time, remaining };
}

/**
 * Clean up the remaining text to form the title
 */
function cleanTitle(text: string): string {
    return text
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        // Remove leading/trailing whitespace
        .trim()
        // Capitalize first letter
        .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Main parser function - converts natural language input to structured task data
 */
export function parseTask(input: string): ParsedTask {
    if (!input || typeof input !== 'string') {
        return {
            title: '',
            dueDate: null,
            dueTime: null,
            project: null,
            labels: [],
            priority: null,
            reminder: null,
            recurring: null,
        };
    }
    
    let remaining = input.trim();
    
    // Parse project (#projectName)
    const projectResult = parseProject(remaining);
    remaining = projectResult.remaining;
    
    // Parse labels (@labelName)
    const labelsResult = parseLabels(remaining);
    remaining = labelsResult.remaining;
    
    // Parse priority (p1, p2, p3, p4)
    const priorityResult = parsePriority(remaining);
    remaining = priorityResult.remaining;
    
    // Parse reminder (!10m, !30m, !1h, !1d)
    const reminderResult = parseReminder(remaining);
    remaining = reminderResult.remaining;
    
    // Parse recurring (every day, every monday, etc.)
    const recurringResult = parseRecurring(remaining);
    remaining = recurringResult.remaining;
    
    // Parse time first (so it doesn't interfere with date parsing)
    const timeResult = parseTime(remaining);
    remaining = timeResult.remaining;
    
    // Parse date (today, tomorrow, monday, etc.)
    const dateResult = parseDate(remaining);
    remaining = dateResult.remaining;
    
    // Use time from date parsing if not already found (e.g., "tonight")
    const finalTime = timeResult.time || dateResult.time;
    
    // Clean up remaining text as title
    const title = cleanTitle(remaining);
    
    return {
        title,
        dueDate: dateResult.date,
        dueTime: finalTime,
        project: projectResult.project,
        labels: labelsResult.labels,
        priority: priorityResult.priority,
        reminder: reminderResult.reminder,
        recurring: recurringResult.recurring,
    };
}

/**
 * Utility function to format parsed task for display
 */
export function formatParsedTask(parsed: ParsedTask): string {
    const parts: string[] = [];
    
    if (parsed.title) parts.push(`Title: "${parsed.title}"`);
    if (parsed.dueDate) parts.push(`Due: ${parsed.dueDate}`);
    if (parsed.dueTime) parts.push(`Time: ${parsed.dueTime}`);
    if (parsed.project) parts.push(`Project: #${parsed.project}`);
    if (parsed.labels.length > 0) parts.push(`Labels: ${parsed.labels.map(l => `@${l}`).join(', ')}`);
    if (parsed.priority) parts.push(`Priority: P${parsed.priority}`);
    if (parsed.reminder) parts.push(`Reminder: ${parsed.reminder}`);
    if (parsed.recurring) parts.push(`Recurring: ${parsed.recurring}`);
    
    return parts.join(' | ');
}

/**
 * Check if the input contains any parseable tokens
 */
export function hasParseableContent(input: string): boolean {
    if (!input) return false;
    
    const patterns = [
        /#\w+/,           // project
        /@\w+/,           // label
        /\bp[1-4]\b/i,    // priority
        /!\d+[mhd]/i,     // reminder
        /\bevery\s+/i,    // recurring
        /\btoday\b/i,     // date keywords
        /\btomorrow\b/i,
        /\btonight\b/i,
        /\bnext\s+/i,
        /\bin\s+\d+\s+(day|week|month)/i,
        /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
        /\b\d{1,2}(am|pm)\b/i,  // time
        /\b\d{1,2}:\d{2}/,
    ];
    
    return patterns.some(pattern => pattern.test(input));
}

// Default export for convenience
export default parseTask;
