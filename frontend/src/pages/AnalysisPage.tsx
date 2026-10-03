import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';

export const AnalysisPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/projects/${id || 'proj_9f8b2a1c'}/studio`);
    }, 2000);
    return () => clearTimeout(timer);
  }, [id, navigate]);

  return (
    <PageContainer title="AI Video Analysis">
      <Card className="max-w-lg mx-auto text-center py-12">
        <Loading label="Gemini is analyzing video semantics, audio pacing, and viral hooks..." />
        <p className="text-xs text-slate-500 mt-4">Generating structured clip recommendations...</p>
      </Card>
    </PageContainer>
  );
};
