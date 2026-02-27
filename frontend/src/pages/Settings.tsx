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
        <div className="settings-page">
            {/* ── Page Header ── */}
            <header className="page-header--elite">
                <div className="page-title-group">
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle--elite">Manage your account and preferences</p>
                </div>
            </header>

            <div className="settings-container--elite">
                {/* Profile Section */}
                <section className="settings-section-card">
                    <div className="settings-section-header">
                        <h2 className="settings-section-title">Profile</h2>
                    </div>
                    <div className="settings-section-content">
                        <div className="settings-row">
                            <div className="settings-row-info">
                                <span className="settings-row-label">Display Name</span>
                                <span className="settings-row-desc">{user?.displayName || 'Not set'}</span>
                            </div>
                        </div>
                        <div className="settings-row">
                            <div className="settings-row-info">
                                <span className="settings-row-label">Email Address</span>
                                <span className="settings-row-desc">{user?.email}</span>
                            </div>
                        </div>
                        {profile?.bio && (
                            <div className="settings-row">
                                <div className="settings-row-info">
                                    <span className="settings-row-label">Bio</span>
                                    <span className="settings-row-desc">{profile.bio}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Preferences Section */}
                <section className="settings-section-card">
                    <div className="settings-section-header">
                        <h2 className="settings-section-title">Preferences</h2>
                    </div>
                    <div className="settings-section-content">
                        <div className="settings-row">
                            <div className="settings-row-info">
                                <span className="settings-row-label">Appearance</span>
                                <span className="settings-row-desc">Choose your preferred application theme</span>
                            </div>
                            <ThemeToggle variant="full" />
                        </div>
                        <div className="settings-row">
                            <div className="settings-row-info">
                                <span className="settings-row-label">Pagination</span>
                                <span className="settings-row-desc">Current limit: 20 tasks per page</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Data Section */}
                <section className="settings-section-card">
                    <div className="settings-section-header">
                        <h2 className="settings-section-title">Data Management</h2>
                    </div>
                    <div className="settings-section-content">
                        <div className="settings-row">
                            <div className="settings-row-info">
                                <span className="settings-row-label">Export Data</span>
                                <span className="settings-row-desc">Download a complete archive of your tasks and habits in JSON format</span>
                            </div>
                            <button className="btn btn-secondary btn-sm">Export</button>
                        </div>
                    </div>
                </section>

                {/* Account Section */}
                <section className="settings-section-card">
                    <div className="settings-section-header">
                        <h2 className="settings-section-title">Account</h2>
                    </div>
                    <div className="settings-section-content">
                        <div className="settings-row">
                            <div className="settings-row-info">
                                <span className="settings-row-label">Session Control</span>
                                <span className="settings-row-desc">Securely sign out of your current session on this device</span>
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Sign Out</button>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="settings-section-card settings-danger-card">
                    <div className="settings-section-header">
                        <h2 className="settings-section-title">Danger Zone</h2>
                    </div>
                    <div className="settings-section-content">
                        <div className="settings-row">
                            <div className="settings-row-info">
                                <span className="settings-row-label" style={{ color: 'var(--error)' }}>Delete Account</span>
                                <span className="settings-row-desc">Permanently erase your account, tasks, habits, and all associated data. This action is irreversible.</span>
                            </div>
                            <button className="btn btn-danger btn-sm">Delete Forever</button>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="settings-section-card">
                    <div className="settings-section-header">
                        <h2 className="settings-section-title">About Productiv</h2>
                    </div>
                    <div className="settings-section-content">
                        <div className="settings-row">
                            <div className="settings-row-info">
                                <span className="settings-row-label">Version</span>
                                <span className="settings-row-desc">Elite Release v1.0.0</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
