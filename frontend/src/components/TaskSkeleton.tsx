export function TaskSkeleton() {
    return (
        <div className="task-skeleton">
            <div className="skeleton-checkbox"></div>
            <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-date"></div>
            </div>
            <div className="skeleton-right">
                <div className="skeleton-dot"></div>
                <div className="skeleton-action"></div>
            </div>
        </div>
    );
}
