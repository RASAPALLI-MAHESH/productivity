import { useState, useMemo, useCallback } from 'react';
import { parseTask, ParsedTask, hasParseableContent } from './taskParser';

export interface UseTaskParserOptions {
    /** Debounce delay in milliseconds (default: 100) */
    debounceMs?: number;
    /** Whether to parse on every keystroke (default: true) */
    livePreview?: boolean;
}

export interface UseTaskParserReturn {
    /** The raw input string */
    input: string;
    /** Set the input string */
    setInput: (value: string) => void;
    /** The parsed task result */
    parsed: ParsedTask;
    /** Whether the input contains parseable content */
    hasParsedContent: boolean;
    /** Clear the input */
    clear: () => void;
    /** Get the final task data (call this when submitting) */
    getTaskData: () => ParsedTask;
}

/**
 * React hook for using the task parser in components
 * 
 * @example
 * ```tsx
 * function TaskInput() {
 *   const { input, setInput, parsed, hasParsedContent, clear, getTaskData } = useTaskParser();
 *   
 *   const handleSubmit = () => {
 *     const task = getTaskData();
 *     console.log('Creating task:', task);
 *     // Submit to API...
 *     clear();
 *   };
 *   
 *   return (
 *     <div>
 *       <input 
 *         value={input} 
 *         onChange={(e) => setInput(e.target.value)}
 *         placeholder="Add task... try: 'Meeting tomorrow 3pm #work @urgent p1'"
 *       />
 *       {hasParsedContent && (
 *         <div className="preview">
 *           {parsed.dueDate && <span>📅 {parsed.dueDate}</span>}
 *           {parsed.project && <span>📁 #{parsed.project}</span>}
 *           {parsed.priority && <span>🔴 P{parsed.priority}</span>}
 *         </div>
 *       )}
 *       <button onClick={handleSubmit}>Add Task</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTaskParser(options: UseTaskParserOptions = {}): UseTaskParserReturn {
    const { livePreview = true } = options;
    
    const [input, setInput] = useState('');
    
    // Parse the input in real-time
    const parsed = useMemo(() => {
        if (!livePreview || !input) {
            return parseTask('');
        }
        return parseTask(input);
    }, [input, livePreview]);
    
    // Check if there's parseable content
    const hasParsedContent = useMemo(() => {
        return hasParseableContent(input);
    }, [input]);
    
    // Clear the input
    const clear = useCallback(() => {
        setInput('');
    }, []);
    
    // Get the final task data (forces a fresh parse)
    const getTaskData = useCallback(() => {
        return parseTask(input);
    }, [input]);
    
    return {
        input,
        setInput,
        parsed,
        hasParsedContent,
        clear,
        getTaskData,
    };
}

export default useTaskParser;
