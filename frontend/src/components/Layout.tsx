import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

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
    const isMobile = useIsMobile();
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

    // Close sidebar on mobile when switching to desktop and vice versa
    useEffect(() => {
        setSidebarOpen(!isMobile);
    }, [isMobile]);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    const layoutClass = [
        'app-layout',
        !sidebarOpen && !isMobile ? 'sidebar-collapsed' : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={layoutClass}>
            <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} isMobile={isMobile} />

            {/* Mobile backdrop */}
            {isMobile && sidebarOpen && (
                <div className="sidebar-backdrop visible" onClick={toggleSidebar} />
            )}

            {/* Main content area */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
