import React, { useState, useRef, useEffect } from 'react';

interface Option {
    value: string;
    label: string;
}

interface SelectProps {
    label?: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function Select({ label, value, options, onChange, placeholder, className = '' }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.value === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'Escape':
                setIsOpen(false);
                break;
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (activeIndex >= 0) {
                    handleSelect(options[activeIndex].value);
                }
                break;
            case 'Tab':
                setIsOpen(false);
                break;
        }
    };

    useEffect(() => {
        if (isOpen) {
            const index = options.findIndex(o => o.value === value);
            setActiveIndex(index);
        }
    }, [isOpen, options, value]);

    return (
        <div
            className={`custom-select-container ${className} ${isOpen ? 'is-open' : ''}`}
            ref={containerRef}
            onKeyDown={handleKeyDown}
        >
            <div className="select-trigger" onClick={toggleOpen} tabIndex={0}>
                {label && <span className="select-label">{label}</span>}
                <div className="select-value-container">
                    <span className="select-value">
                        {selectedOption ? selectedOption.label : placeholder || 'Select...'}
                    </span>
                    <span className="material-symbols-outlined select-chevron">expand_more</span>
                </div>
            </div>

            {isOpen && (
                <div className="select-dropdown" ref={listRef} role="listbox">
                    {options.map((option, index) => (
                        <div
                            key={option.value}
                            className={`select-item ${option.value === value ? 'selected' : ''} ${index === activeIndex ? 'active' : ''}`}
                            onClick={() => handleSelect(option.value)}
                            role="option"
                            aria-selected={option.value === value}
                        >
                            <span className="item-label">{option.label}</span>
                            {option.value === value && (
                                <span className="material-symbols-outlined item-check">check</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
