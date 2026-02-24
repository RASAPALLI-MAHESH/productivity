import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VibeBackground } from './components/VibeBackground';
import { CookieConsent } from './components/CookieConsent';

// Lazy-loaded pages for code splitting
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then((m) => ({ default: m.Signup })));
const VerifyOtp = lazy(() => import('./pages/VerifyOtp').then((m) => ({ default: m.VerifyOtp })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then((m) => ({ default: m.ResetPassword })));
const AccountLocked = lazy(() => import('./pages/AccountLocked').then((m) => ({ default: m.AccountLocked })));
const EmailNotVerified = lazy(() => import('./pages/EmailNotVerified').then((m) => ({ default: m.EmailNotVerified })));
const Tasks = lazy(() => import('./pages/Tasks').then((m) => ({ default: m.Tasks })));
const Habits = lazy(() => import('./pages/Habits').then((m) => ({ default: m.Habits })));
const Deadlines = lazy(() => import('./pages/Deadlines').then((m) => ({ default: m.Deadlines })));
const Onboarding = lazy(() => import('./pages/Onboarding').then((m) => ({ default: m.Onboarding })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));

function AppLoader() {
    return (
        <div className="loader" style={{ minHeight: '100vh' }}>
            <div className="spinner" />
        </div>
    );
}

function App() {
    const { initAuth, initialized, user, profile } = useAuthStore();
    const { theme } = useThemeStore(); // Initialize theme

    useEffect(() => {
        const unsubscribe = initAuth();
        return () => unsubscribe();
    }, [initAuth]);

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    if (!initialized) {
        return <AppLoader />;
    }

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <VibeBackground />
                <CookieConsent />
                <Suspense fallback={<AppLoader />}>
                    <Routes>
                        {/* Public auth routes */}
                        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
                        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
                        <Route path="/verify-otp" element={<VerifyOtp />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/account-locked" element={<AccountLocked />} />
                        <Route path="/email-not-verified" element={<EmailNotVerified />} />

                        {/* Protected routes */}
                        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                            <Route index element={profile && !profile.onboarded ? <Navigate to="/onboarding" replace /> : <Tasks />} />
                            <Route path="tasks" element={profile && !profile.onboarded ? <Navigate to="/onboarding" replace /> : <Tasks />} />
                            <Route path="habits" element={profile && !profile.onboarded ? <Navigate to="/onboarding" replace /> : <Habits />} />
                            <Route path="deadlines" element={profile && !profile.onboarded ? <Navigate to="/onboarding" replace /> : <Deadlines />} />
                            <Route path="settings" element={profile && !profile.onboarded ? <Navigate to="/onboarding" replace /> : <Settings />} />
                            <Route path="onboarding" element={profile?.onboarded ? <Navigate to="/" replace /> : <Onboarding />} />
                        </Route>

                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
