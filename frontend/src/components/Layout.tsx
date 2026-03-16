import { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return isMobile;
}

interface MobileBottomBarProps {
    onAddTask: () => void;
}

function MobileBottomBar({ onAddTask }: MobileBottomBarProps) {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const navItems = [
        { to: '/tasks', icon: 'task_alt', label: 'Tasks' },
        { to: '/habits', icon: 'local_fire_department', label: 'Habits' },
        { to: '/deadlines', icon: 'flag', label: 'Deadlines' },
    ];

    return (
        <nav className="mobile-bottom-bar">
            {navItems.slice(0, 2).map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `mbb-link ${isActive ? 'active' : ''}`}
                >
                    <span className="material-symbols-outlined mbb-icon">{item.icon}</span>
                    <span className="mbb-label">{item.label}</span>
                </NavLink>
            ))}

            {/* Centre + FAB */}
            <button
                className="mbb-fab"
                onClick={onAddTask}
                aria-label="Add task"
            >
                <span className="material-symbols-outlined">add</span>
            </button>

            {navItems.slice(2).map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `mbb-link ${isActive ? 'active' : ''}`}
                >
                    <span className="material-symbols-outlined mbb-icon">{item.icon}</span>
                    <span className="mbb-label">{item.label}</span>
                </NavLink>
            ))}

            {/* Profile */}
            <button
                className="mbb-link"
                onClick={() => navigate('/settings')}
                aria-label="Settings"
            >
                <span className="material-symbols-outlined mbb-icon">
                    {user?.displayName?.charAt(0) ? 'account_circle' : 'person'}
                </span>
                <span className="mbb-label">Profile</span>
            </button>
        </nav>
    );
}

interface MobileTopBarProps {
    onOpenSidebar: () => void;
}

function MobileTopBar({ onOpenSidebar }: MobileTopBarProps) {
    return (
        <header className="mobile-topbar">
            <button
                className="mobile-topbar__hamburger"
                onClick={onOpenSidebar}
                aria-label="Open navigation"
            >
                <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="mobile-topbar__brand">
                <div className="mobile-topbar__logo-icon">
                    <span className="material-symbols-outlined icon-filled" style={{ fontSize: 16 }}>bolt</span>
                </div>
                <span className="mobile-topbar__wordmark">Productiv</span>
            </div>
            <div style={{ width: 40 }} /> {/* Spacer for centering */}
        </header>
    );
}

export function Layout() {
    const { focusMode } = useAppStore();
    const isMobile = useIsMobile();
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile && !focusMode);
    const [showMobileCreate, setShowMobileCreate] = useState(false);

    useEffect(() => {
        if (focusMode) {
            setSidebarOpen(false);
        } else {
            setSidebarOpen(!isMobile);
        }
    }, [isMobile, focusMode]);

    const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);

    const layoutClass = [
        'app-layout',
        !sidebarOpen && !isMobile ? 'sidebar-collapsed' : '',
        focusMode ? 'focus-mode' : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={layoutClass}>
            {/* Mobile Top Bar */}
            {!focusMode && isMobile && (
                <MobileTopBar onOpenSidebar={toggleSidebar} />
            )}

            {/* Sidebar — always rendered, drawer on mobile */}
            {!focusMode && (
                <Sidebar
                    isOpen={sidebarOpen}
                    onToggle={toggleSidebar}
                    isMobile={isMobile}
                />
            )}

            {/* Backdrop for mobile sidebar drawer */}
            {isMobile && sidebarOpen && (
                <div
                    className="sidebar-backdrop visible"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Main content area */}
            <main className="main-content">
                <div className="content-container">
                    <Outlet context={{ showMobileCreate, setShowMobileCreate }} />
                </div>
            </main>

            {/* Mobile Bottom Navigation Bar */}
            {!focusMode && isMobile && (
                <MobileBottomBar onAddTask={() => setShowMobileCreate(true)} />
            )}
        </div>
    );
}
