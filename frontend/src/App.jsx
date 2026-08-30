import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { TopBar } from './components/shell/TopBar';
import { Sidebar } from './components/shell/Sidebar';
import { WorkspacePage } from './pages/WorkspacePage';
import { NewAnalysisPage } from './pages/NewAnalysisPage';
import { DashboardPage } from './pages/DashboardPage';
import { QueuePage } from './pages/QueuePage';
import { IntelligencePage } from './pages/IntelligencePage';
import { ContractorsPage } from './pages/ContractorsPage';
import { DistrictMatrixPage } from './pages/DistrictMatrixPage';
import { DataLineagePage } from './pages/DataLineagePage';
import { AuditLogPage } from './pages/AuditLogPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-viewport">
          <div className="master-frame">
            <Sidebar />
            <div className="main-layout">
              <TopBar />
              <main className="main-content">
                <div className="page-container">
                  <Routes>
                    <Route path="/" element={<WorkspacePage />} />
                    <Route path="/workspaces" element={<WorkspacePage />} />
                    <Route path="/new-analysis" element={<NewAnalysisPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/queue" element={<QueuePage />} />
                    <Route path="/project/:workId/*" element={<IntelligencePage />} />
                    <Route path="/project/:workId" element={<IntelligencePage />} />
                    <Route path="/project/*" element={<IntelligencePage />} />
                    <Route path="/contractors" element={<ContractorsPage />} />
                    <Route path="/district-matrix" element={<DistrictMatrixPage />} />
                    <Route path="/data-lineage" element={<DataLineagePage />} />
                    <Route path="/audit-log" element={<AuditLogPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
