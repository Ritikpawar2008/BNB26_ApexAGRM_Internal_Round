import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { StudioPage } from './pages/StudioPage';
import { ExportPage } from './pages/ExportPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 flex overflow-hidden">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/projects/new" element={<UploadPage />} />
              <Route path="/projects/:id/analysis" element={<AnalysisPage />} />
              <Route path="/projects/:id/studio" element={<StudioPage />} />
              <Route path="/projects/:id/export" element={<ExportPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};
