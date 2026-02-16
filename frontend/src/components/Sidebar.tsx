import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function Sidebar() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/', icon: '📊', label: 'Dashboard' },
        { to: '/tasks', icon: '✅', label: 'Tasks' },
        { to: '/habits', icon: '🔥', label: 'Habits' },
        { to: '/deadlines', icon: '⏰', label: 'Deadlines' },
        { to: '/settings', icon: '⚙️', label: 'Settings' },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">⚡</div>
                    <h1>Productiv</h1>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }: { isActive: boolean }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            end={item.to === '/'}
                        >
                            <span className="link-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{user?.displayName || 'User'}</div>
                            <div className="user-email">{user?.email}</div>
                        </div>
                    </div>
                    <button className="sidebar-link" onClick={handleLogout} style={{ marginTop: '8px' }}>
                        <span className="link-icon">🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Bar */}
            <nav className="bottom-bar">
                {navItems.slice(0, 4).map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }: { isActive: boolean }) => `bottom-bar-link ${isActive ? 'active' : ''}`}
                        end={item.to === '/'}
                    >
                        <span className="link-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
                <NavLink
                    to="/settings"
                    className={({ isActive }: { isActive: boolean }) => `bottom-bar-link ${isActive ? 'active' : ''}`}
                >
                    <span className="link-icon">⚙️</span>
                    <span>Settings</span>
                </NavLink>
            </nav>
        </>
    );
}
