import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { UploadCloud } from 'lucide-react';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSimulatedUpload = () => {
    navigate('/projects/proj_9f8b2a1c/analysis');
  };

  return (
    <PageContainer title="New Project" subtitle="Upload a video to analyze viral moments">
      <Card className="max-w-2xl mx-auto border-dashed border-2 border-slate-700 hover:border-indigo-500 p-12 text-center">
        <UploadCloud className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Drag and drop your video here</h3>
        <p className="text-sm text-slate-400 mb-6">Supports MP4, MOV, WebM up to 100MB</p>
        <Button onClick={handleSimulatedUpload}>Simulate Video Upload (Demo)</Button>
      </Card>
    </PageContainer>
  );
};
