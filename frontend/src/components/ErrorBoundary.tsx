import { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="empty-state">
                    <div className="empty-icon">⚠️</div>
                    <h3>Something went wrong</h3>
                    <p>{this.state.error?.message}</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
