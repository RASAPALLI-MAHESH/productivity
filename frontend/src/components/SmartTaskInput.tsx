import React, { useRef, useEffect } from 'react';
import { useTaskParser } from '../lib/useTaskParser';
import './SmartTaskInput.css';

export interface SmartTaskInputProps {
    /** Callback when a task is submitted */
    onSubmit?: (task: {
        title: string;
        dueDate: string | null;
        dueTime: string | null;
        project: string | null;
        labels: string[];
        priority: number | null;
        reminder: string | null;
        recurring: string | null;
    }) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Auto-focus on mount */
    autoFocus?: boolean;
    /** Custom class name */
    className?: string;
}

/**
 * Smart Task Input - Todoist-style natural language task entry
 * 
 * Supports:
 * - #project - Assign to project
 * - @label - Add labels
 * - p1-p4 - Set priority
 * - !30m - Set reminder (10m, 30m, 1h, 1d)
 * - today, tomorrow, monday, next week - Set due date
 * - 6pm, 18:00, at 3 - Set due time
 * - every day, every monday - Set recurring
 * 
 * @example
 * <SmartTaskInput 
 *   onSubmit={(task) => console.log('New task:', task)}
 *   placeholder="Add a task..."
 * />
 */
export function SmartTaskInput({ 
    onSubmit, 
    placeholder = "Try: 'Design meeting tomorrow 3pm #work @design p1 !30m'",
    autoFocus = false,
    className = ''
}: SmartTaskInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { input, setInput, parsed, hasParsedContent, clear, getTaskData } = useTaskParser();
    
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const task = getTaskData();
        if (!task.title.trim()) return;
        
        onSubmit?.(task);
        clear();
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
        }
        if (e.key === 'Escape') {
            clear();
            inputRef.current?.blur();
        }
    };
    
    return (
        <div className={`smart-task-input ${className}`}>
            <form onSubmit={handleSubmit} className="smart-task-input__form">
                <div className="smart-task-input__icon">
                    <span className="material-symbols-outlined">add_circle</span>
                </div>
                
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="smart-task-input__field"
                    autoComplete="off"
                />
                
                {input && (
                    <button 
                        type="button" 
                        onClick={clear}
                        className="smart-task-input__clear"
                        aria-label="Clear input"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                )}
                
                <button 
                    type="submit" 
                    className="smart-task-input__submit"
                    disabled={!parsed.title.trim()}
                >
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </form>
            
            {/* Live Preview */}
            {hasParsedContent && input && (
                <div className="smart-task-input__preview">
                    {parsed.title && (
                        <span className="smart-task-preview__title">
                            {parsed.title}
                        </span>
                    )}
                    
                    <div className="smart-task-preview__tags">
                        {parsed.dueDate && (
                            <span className="smart-task-preview__tag smart-task-preview__tag--date">
                                <span className="material-symbols-outlined">event</span>
                                {parsed.dueDate}
                                {parsed.dueTime && ` at ${parsed.dueTime}`}
                            </span>
                        )}
                        
                        {parsed.project && (
                            <span className="smart-task-preview__tag smart-task-preview__tag--project">
                                <span className="material-symbols-outlined">folder</span>
                                {parsed.project}
                            </span>
                        )}
                        
                        {parsed.labels.length > 0 && (
                            <span className="smart-task-preview__tag smart-task-preview__tag--label">
                                <span className="material-symbols-outlined">label</span>
                                {parsed.labels.join(', ')}
                            </span>
                        )}
                        
                        {parsed.priority && (
                            <span className={`smart-task-preview__tag smart-task-preview__tag--priority smart-task-preview__tag--p${parsed.priority}`}>
                                <span className="material-symbols-outlined">flag</span>
                                P{parsed.priority}
                            </span>
                        )}
                        
                        {parsed.reminder && (
                            <span className="smart-task-preview__tag smart-task-preview__tag--reminder">
                                <span className="material-symbols-outlined">notifications</span>
                                {parsed.reminder}
                            </span>
                        )}
                        
                        {parsed.recurring && (
                            <span className="smart-task-preview__tag smart-task-preview__tag--recurring">
                                <span className="material-symbols-outlined">repeat</span>
                                {parsed.recurring}
                            </span>
                        )}
                    </div>
                </div>
            )}
            
            {/* Help tooltip */}
            {!input && (
                <div className="smart-task-input__hints">
                    <span className="hint">#project</span>
                    <span className="hint">@label</span>
                    <span className="hint">p1-p4</span>
                    <span className="hint">tomorrow</span>
                    <span className="hint">3pm</span>
                    <span className="hint">!30m</span>
                </div>
            )}
        </div>
    );
}

export default SmartTaskInput;
