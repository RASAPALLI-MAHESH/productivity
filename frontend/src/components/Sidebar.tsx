import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    isMobile: boolean;
}

export function Sidebar({ isOpen, onToggle, isMobile }: SidebarProps) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/tasks', icon: 'task_alt', label: 'Tasks' },
        { to: '/habits', icon: 'local_fire_department', label: 'Habits' },
        { to: '/deadlines', icon: 'schedule', label: 'Deadlines' },
        { to: '/settings', icon: 'settings', label: 'Settings' },
    ];

    const sidebarClass = [
        'sidebar',
        !isOpen && !isMobile ? 'collapsed' : '',
        isMobile && isOpen ? 'mobile-open' : '',
    ].filter(Boolean).join(' ');

    return (
        <>
            {/* Desktop & Mobile Sidebar */}
            <aside className={sidebarClass}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="logo-icon material-symbols-outlined icon-filled" style={{ fontSize: 24 }}>bolt</span>
                        <h1>Productiv</h1>
                    </div>
                    {!isMobile && (
                        <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar" title={isOpen ? "Collapse sidebar" : "Expand sidebar"}>
                            <span className="material-symbols-outlined">
                                {isOpen ? 'menu_open' : 'menu'}
                            </span>
                        </button>
                    )}
                    {isMobile && (
                        <button className="sidebar-toggle" onClick={onToggle} aria-label="Close sidebar">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }: { isActive: boolean }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            end={item.to === '/'}
                            onClick={() => isMobile && onToggle()}
                            title={!isOpen ? item.label : undefined}
                        >
                            <span className="link-icon material-symbols-outlined">{item.icon}</span>
                            <span className="link-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user" title={!isOpen ? (user?.displayName || user?.email || 'User') : undefined}>
                        <div className="user-avatar">
                            {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{user?.displayName || 'User'}</div>
                            <div className="user-email">{user?.email}</div>
                        </div>
                    </div>
                    <button
                        className="sidebar-link"
                        onClick={handleLogout}
                        style={{ marginTop: 4 }}
                        title={!isOpen ? 'Logout' : undefined}
                    >
                        <span className="link-icon material-symbols-outlined">logout</span>
                        <span className="link-label">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Bar */}
            <nav className="bottom-bar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }: { isActive: boolean }) => `bottom-bar-link ${isActive ? 'active' : ''}`}
                        end={item.to === '/'}
                    >
                        <span className="link-icon"><span className="material-symbols-outlined">{item.icon}</span></span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </>
    );
}
