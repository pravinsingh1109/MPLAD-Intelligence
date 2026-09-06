import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { TopBar } from './components/shell/TopBar';
import { Sidebar } from './components/shell/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { NewAnalysisPage } from './pages/NewAnalysisPage';
import { DashboardPage } from './pages/DashboardPage';
import { QueuePage } from './pages/QueuePage';
import { IntelligencePage } from './pages/IntelligencePage';
import { ContractorsPage } from './pages/ContractorsPage';
import { DistrictMatrixPage } from './pages/DistrictMatrixPage';
import { DataLineagePage } from './pages/DataLineagePage';
import { AuditLogPage } from './pages/AuditLogPage';

// Application Shell Wrapper for Internal Operational Routes
const AppShell = ({ children }) => {
  return (
    <div className="app-viewport">
      <div className="master-frame">
        <Sidebar />
        <div className="main-layout">
          <TopBar />
          <main className="main-content">
            <div className="page-container">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Institutional Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Operational Application Platform */}
          <Route path="/workspaces" element={<AppShell><WorkspacePage /></AppShell>} />
          <Route path="/new-analysis" element={<AppShell><NewAnalysisPage /></AppShell>} />
          <Route path="/dashboard" element={<AppShell><DashboardPage /></AppShell>} />
          <Route path="/queue" element={<AppShell><QueuePage /></AppShell>} />
          <Route path="/project/:workId/*" element={<AppShell><IntelligencePage /></AppShell>} />
          <Route path="/project/:workId" element={<AppShell><IntelligencePage /></AppShell>} />
          <Route path="/project" element={<AppShell><IntelligencePage /></AppShell>} />
          <Route path="/project/*" element={<AppShell><IntelligencePage /></AppShell>} />
          <Route path="/contractors" element={<AppShell><ContractorsPage /></AppShell>} />
          <Route path="/district-matrix" element={<AppShell><DistrictMatrixPage /></AppShell>} />
          <Route path="/data-lineage" element={<AppShell><DataLineagePage /></AppShell>} />
          <Route path="/audit-log" element={<AppShell><AuditLogPage /></AppShell>} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

