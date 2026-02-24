import { useState, useRef, useEffect, ReactNode } from 'react';

interface MenuItem {
    label: string;
    icon?: string;
    onClick: () => void;
    critical?: boolean;
}

interface MenuProps {
    trigger: ReactNode;
    items: MenuItem[];
    position?: 'left' | 'right';
}

export function Menu({ trigger, items, position = 'right' }: MenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="menu-container" ref={menuRef}>
            <div className="menu-trigger" onClick={() => setIsOpen(!isOpen)}>
                {trigger}
            </div>

            {isOpen && (
                <div className={`menu-dropdown menu-pos-${position}`}>
                    {items.map((item, index) => (
                        <button
                            key={index}
                            className={`menu-item ${item.critical ? 'menu-item-critical' : ''}`}
                            onClick={() => {
                                item.onClick();
                                setIsOpen(false);
                            }}
                        >
                            {item.icon && (
                                <span className="material-symbols-outlined icon-sm">{item.icon}</span>
                            )}
                            <span className="menu-item-label">{item.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
