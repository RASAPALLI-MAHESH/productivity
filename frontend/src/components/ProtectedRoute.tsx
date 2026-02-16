import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

export function ProtectedRoute({ children }: Props) {
    const { user, initialized, loading } = useAuthStore();

    if (!initialized || loading) {
        return (
            <div className="loader">
                <div className="spinner" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
