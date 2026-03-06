import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { useHabitStore } from '../store/habitStore';
import { ThemeToggle } from '../components/ThemeToggle';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Settings() {
    const { user, profile, logout, updateProfile } = useAuthStore();
    const { tasks } = useAppStore();
    const { habits } = useHabitStore();
    const navigate = useNavigate();

    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState(user?.displayName || '');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [editBio, setEditBio] = useState(profile?.bio || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleSaveName = async () => {
        if (!editName.trim()) return setIsEditingName(false);
        await updateProfile({ displayName: editName });
        setIsEditingName(false);
    };

    const handleSaveBio = async () => {
        await updateProfile({ bio: editBio });
        setIsEditingBio(false);
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            await updateProfile({ photoURL: base64String });
        };
        reader.readAsDataURL(file);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const brandColor = '#1e40af';

        // Title
        doc.setFontSize(22);
        doc.setTextColor(brandColor);
        doc.text('Productiv Export', 14, 22);

        // Subtitle
        doc.setFontSize(12);
        doc.setTextColor('#4b5563');
        const exportDate = new Date().toLocaleDateString();
        doc.text(`Data archive for ${user?.displayName || user?.email} — ${exportDate}`, 14, 30);

        // Tasks Table
        doc.setFontSize(16);
        doc.setTextColor('#111827');
        doc.text('Tasks', 14, 45);

        autoTable(doc, {
            startY: 50,
            head: [['Title', 'Status', 'Priority', 'Deadline']],
            body: tasks.map(t => [
                t.title,
                t.status === 'done' ? 'Completed' : 'Pending',
                t.priority,
                t.deadline ? new Date(t.deadline).toLocaleDateString() : 'None',
            ]),
            headStyles: { fillColor: brandColor },
            styles: { fontSize: 10 },
            margin: { left: 14, right: 14 }
        });

        // Habits Table
        const finalY = (doc as any).lastAutoTable.finalY || 50;
        doc.text('Habits', 14, finalY + 15);

        autoTable(doc, {
            startY: finalY + 20,
            head: [['Habit Name', 'Category', 'Current Streak']],
            body: habits.map(h => [
                h.name,
                h.category,
                `${h.currentStreak} days`,
            ]),
            headStyles: { fillColor: '#10b981' }, // Green for habits
            styles: { fontSize: 10 },
            margin: { left: 14, right: 14 }
        });

        // Footer and Border
        const pageCount = doc.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // Draw Border
            doc.setDrawColor(30, 64, 175); // Brand border
            doc.setLineWidth(1);
            doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

            doc.setFontSize(10);
            doc.setTextColor('#9ca3af');
            doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
        }

        doc.save(`Productiv_Export_${exportDate.replace(/\//g, '-')}.pdf`);
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
    const { deleteAccount, loading: authLoading } = useAuthStore();

    const handleDeleteAccount = async () => {
        if (deleteConfirmEmail.toLowerCase() !== user?.email?.toLowerCase()) return;
        try {
            await deleteAccount();
            navigate('/login');
        } catch (err) {
            console.error('Account deletion failed', err);
        }
    };

    const avatarLetter = user?.displayName?.[0] || user?.email?.[0] || 'U';

    return (
        <div className="tasks-page">
            <header className="page-header--elite">
                <div className="page-title-group">
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle--elite" style={{ display: 'block' }}>Manage your account and preferences</p>
                </div>
            </header>

            <div className="content-container">
                <section className="settings-section-card" style={{ marginBottom: '32px' }}>
                    <div className="settings-section-header">
                        <h2 className="settings-section-title">Profile</h2>
                    </div>
                    <div className="settings-section-content">

                        {/* Avatar Picker */}
                        <div className="settings-row" style={{ alignItems: 'flex-start', padding: '24px 16px' }}>
                            <div className="settings-row-info">
                                <span className="settings-row-label">Profile Picture</span>
                                <span className="settings-row-desc">Click your avatar to upload a custom photo.</span>
                            </div>
                            <div
                                style={{
                                    width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-light)',
                                    color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 24, fontWeight: 600, cursor: 'pointer', overflow: 'hidden', border: '1px solid var(--border)',
                                    backgroundImage: user?.photoURL ? `url(${user.photoURL})` : 'none',
                                    backgroundSize: 'cover', backgroundPosition: 'center'
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                title="Change Avatar"
                            >
                                {!user?.photoURL && avatarLetter.toUpperCase()}
                            </div>
                            <input
                                type="file" ref={fileInputRef} onChange={handleAvatarUpload}
                                accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }}
                            />
                        </div>

                        {/* Display Name Edit */}
                        <div className="settings-row">
                            <div className="settings-row-info" style={{ flex: 1 }}>
                                <span className="settings-row-label">Display Name</span>
                                {isEditingName ? (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: 8 }}>
                                        <input
                                            autoFocus
                                            className="search-input"
                                            style={{ paddingLeft: 12, flex: 1, marginTop: 0 }}
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                                        />
                                        <button className="btn btn-primary btn-sm" onClick={handleSaveName}>Save</button>
                                    </div>
                                ) : (
                                    <span className="settings-row-desc">{user?.displayName || 'Not set'}</span>
                                )}
                            </div>
                            {!isEditingName && (
                                <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingName(true)}>Edit</button>
                            )}
                        </div>

                        {/* Bio Edit */}
                        <div className="settings-row">
                            <div className="settings-row-info" style={{ flex: 1 }}>
                                <span className="settings-row-label">Bio</span>
                                {isEditingBio ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 8 }}>
                                        <textarea
                                            autoFocus
                                            className="search-input"
                                            style={{ paddingLeft: 12, minHeight: 60, paddingTop: 8, marginTop: 0 }}
                                            value={editBio}
                                            onChange={e => setEditBio(e.target.value)}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button className="btn btn-primary btn-sm" onClick={handleSaveBio}>Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="settings-row-desc">{profile?.bio || 'Write a short bio about what drives you...'}</span>
                                )}
                            </div>
                            {!isEditingBio && (
                                <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingBio(true)}>Edit</button>
                            )}
                        </div>
                    </div>
                </section>

                <section className="settings-section-card" style={{ marginBottom: '32px' }}>
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
                    </div>
                </section>

                <section className="settings-section-card" style={{ marginBottom: '32px' }}>
                    <div className="settings-section-header">
                        <h2 className="settings-section-title">Data Management</h2>
                    </div>
                    <div className="settings-section-content">
                        <div className="settings-row">
                            <div className="settings-row-info">
                                <span className="settings-row-label">Export Data</span>
                                <span className="settings-row-desc">Download a beautifully formatted PDF archive of all your tasks and habits.</span>
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={handleExportPDF}>
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                                Export PDF
                            </button>
                        </div>
                    </div>
                </section>

                <section className="settings-section-card settings-danger-card">
                    <div className="settings-section-header">
                        <h2 className="settings-section-title">Account</h2>
                    </div>
                    <div className="settings-section-content">
                        <div className="settings-row">
                            <div className="settings-row-info">
                                <span className="settings-row-label">Session Control</span>
                                <span className="settings-row-desc">Securely sign out of your current session on this device.</span>
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Sign Out</button>
                        </div>
                        <div className="settings-row" style={{ borderBottom: 'none' }}>
                            <div className="settings-row-info">
                                <span className="settings-row-label" style={{ color: 'var(--error)' }}>Delete Account</span>
                                <span className="settings-row-desc">Permanently erase your account, tasks, habits, and all associated data.</span>
                            </div>
                            <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteModal(true)}>Delete Account</button>
                        </div>
                    </div>
                </section>

                {/* Account Deletion Confirmation Modal */}
                {showDeleteModal && (
                    <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setShowDeleteModal(false)}>
                        <div className="modal-container dangerous" style={{ maxWidth: 450, padding: '32px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title" style={{ color: 'var(--error)' }}>Delete Account Permanently?</h2>
                                <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="modal-body" style={{ marginTop: '16px' }}>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                                    This action is **irreversible**. You will lose access to your tasks, habits, and all profile data instantly.
                                </p>

                                <div style={{ background: 'var(--danger-light)', padding: '16px', borderRadius: '8px', border: '1px solid var(--error-alpha)', marginBottom: '24px' }}>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--error)', fontWeight: 500 }}>
                                        To confirm, please type your email address: <br />
                                        <strong style={{ fontSize: '14px' }}>{user?.email}</strong>
                                    </p>
                                </div>

                                <input
                                    className="search-input"
                                    style={{ paddingLeft: 12, width: '100%', marginBottom: '24px' }}
                                    placeholder="your-email@example.com"
                                    value={deleteConfirmEmail}
                                    onChange={e => setDeleteConfirmEmail(e.target.value)}
                                    autoFocus
                                />

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ flex: 1 }}
                                        onClick={() => setShowDeleteModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        style={{ flex: 1.5 }}
                                        disabled={deleteConfirmEmail.toLowerCase() !== user?.email?.toLowerCase() || authLoading}
                                        onClick={handleDeleteAccount}
                                    >
                                        {authLoading ? 'Deleting...' : 'Permanently Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
