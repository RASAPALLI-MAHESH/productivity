import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';

export function UndoToast() {
    const { lastDeletedTask, undoDeleteTask } = useAppStore();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (lastDeletedTask) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 4500); // Start fade before 5s
            return () => clearTimeout(timer);
        } else {
            setVisible(false);
        }
    }, [lastDeletedTask]);

    if (!lastDeletedTask || !visible) return null;

    return (
        <div className="undo-toast">
            <div className="undo-toast-content">
                <span>Task deleted.</span>
                <button className="undo-btn" onClick={undoDeleteTask}>
                    Undo
                </button>
            </div>
            <div className="undo-progress-bar" />
        </div>
    );
}
