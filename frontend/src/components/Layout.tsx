import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAppStore } from '../store/appStore';

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return isMobile;
}

export function Layout() {
    const { focusMode } = useAppStore();
    const isMobile = useIsMobile();
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile && !focusMode);

    // Close sidebar on mobile when switching to desktop and vice versa
    // Also respect focusMode
    useEffect(() => {
        if (focusMode) {
            setSidebarOpen(false);
        } else {
            setSidebarOpen(!isMobile);
        }
    }, [isMobile, focusMode]);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    const layoutClass = [
        'app-layout',
        !sidebarOpen && !isMobile ? 'sidebar-collapsed' : '',
        focusMode ? 'focus-mode' : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={layoutClass}>
            {!focusMode && (
                <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} isMobile={isMobile} />
            )}

            {/* Mobile backdrop */}
            {isMobile && sidebarOpen && (
                <div className="sidebar-backdrop visible" onClick={toggleSidebar} />
            )}

            {/* Main content area */}
            <main className="main-content">
                <div className="content-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
