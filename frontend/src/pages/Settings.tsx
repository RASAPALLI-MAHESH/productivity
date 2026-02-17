import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

import { ThemeToggle } from '../components/ThemeToggle';

export function Settings() {
    const { user, profile, logout } = useAuthStore();

    const navigate = useNavigate();
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your account and preferences</p>
                </div>
            </div>

            {/* ... rest of the file ... */}

            <div className="settings-container">
                {/* Profile Section */}
                <div className="settings-section">
                    <div className="settings-section-title">Profile</div>
                    <div className="settings-item">
                        <div>
                            <div className="settings-item-label">Display Name</div>
                            <div className="settings-item-desc">{user?.displayName || 'Not set'}</div>
                        </div>
                    </div>
                    <div className="settings-item">
                        <div>
                            <div className="settings-item-label">Email</div>
                            <div className="settings-item-desc">{user?.email}</div>
                        </div>
                    </div>
                    {profile?.bio && (
                        <div className="settings-item">
                            <div>
                                <div className="settings-item-label">Bio</div>
                                <div className="settings-item-desc">{profile.bio}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preferences Section */}
                <div className="settings-section">
                    <div className="settings-section-title">Preferences</div>
                    <div className="settings-item">
                        <div>
                            <div className="settings-item-label">Theme</div>
                            <div className="settings-item-desc">Choose your preferred appearance</div>
                        </div>
                        <ThemeToggle variant="full" />
                    </div>
                    <div className="settings-item">
                        <div>
                            <div className="settings-item-label">Tasks per page</div>
                            <div className="settings-item-desc">20 tasks</div>
                        </div>
                    </div>
                </div>

                {/* Data Section */}
                <div className="settings-section">
                    <div className="settings-section-title">Data</div>
                    <div className="settings-item">
                        <div>
                            <div className="settings-item-label">Export Data</div>
                            <div className="settings-item-desc">Download all your tasks and habits as JSON</div>
                        </div>
                        <button className="btn btn-secondary btn-sm">Export</button>
                    </div>
                </div>

                {/* Account Section */}
                <div className="settings-section">
                    <div className="settings-section-title">Account</div>
                    <div className="settings-item">
                        <div>
                            <div className="settings-item-label">Sign Out</div>
                            <div className="settings-item-desc">Sign out of your account on this device</div>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Sign Out</button>
                    </div>

                    <div className="settings-danger-zone" style={{ marginTop: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div className="settings-item-label" style={{ color: 'var(--danger)' }}>Delete Account</div>
                                <div className="settings-item-desc">Permanently delete your account and all data</div>
                            </div>
                            <button className="btn btn-danger btn-sm">Delete</button>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="settings-section">
                    <div className="settings-section-title">About</div>
                    <div className="settings-item">
                        <div>
                            <div className="settings-item-label">Productiv</div>
                            <div className="settings-item-desc">Version 1.0.0</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
