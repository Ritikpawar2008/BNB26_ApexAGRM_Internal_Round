import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { StudioPage } from './pages/StudioPage';
import { ExportPage } from './pages/ExportPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects/new" element={<UploadPage />} />
          <Route path="/projects/:id/analysis" element={<AnalysisPage />} />
          <Route path="/projects/:id/studio" element={<StudioPage />} />
          <Route path="/projects/:id/export" element={<ExportPage />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
};
