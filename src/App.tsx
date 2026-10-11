import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FairworkProvider } from './context/FairworkContext';
import { AppShell } from './components/layout/AppShell';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { LoginPage } from './pages/LoginPage';

// App Workspace Pages
import { DashboardPage } from './pages/app/DashboardPage';
import { ProjectsPage } from './pages/app/ProjectsPage';
import { NewProjectPage } from './pages/app/NewProjectPage';
import { ProjectDetailPage } from './pages/app/ProjectDetailPage';
import { AgreementsPage } from './pages/app/AgreementsPage';
import { PaymentsPage } from './pages/app/PaymentsPage';
import { DisputesPage } from './pages/app/DisputesPage';
import { ActivityPage } from './pages/app/ActivityPage';
import { SettingsPage } from './pages/app/SettingsPage';

import { ProtectedRoute } from './components/auth/ProtectedRoute';

export function App() {
  return (
    <FairworkProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* App Workspace Shell Protected by Server/Profile Authentication */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route
              path="projects/new"
              element={
                <ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}>
                  <NewProjectPage />
                </ProtectedRoute>
              }
            />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="agreements" element={<AgreementsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="disputes" element={<DisputesPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </FairworkProvider>
  );
}

export default App;
