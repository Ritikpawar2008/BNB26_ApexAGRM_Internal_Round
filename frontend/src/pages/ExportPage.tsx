import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Download, CheckCircle2 } from 'lucide-react';

export const ExportPage: React.FC = () => {
  return (
    <PageContainer title="Export Complete" subtitle="Your short clips have been stitched and formatted">
      <Card className="max-w-xl mx-auto text-center py-10 space-y-6">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Ready for Social Platforms</h2>
          <p className="text-sm text-slate-400">Formatted as 9:16 Vertical Short (1080x1920)</p>
        </div>
        <div className="flex justify-center gap-3">
          <Badge variant="info" text="9:16 Vertical" />
          <Badge variant="info" text="1080p Full HD" />
          <Badge variant="info" text="42s Duration" />
        </div>
        <Button size="lg" className="w-full max-w-xs mx-auto flex items-center justify-center gap-2">
          <Download className="w-5 h-5" /> Download Stitched MP4
        </Button>
      </Card>
    </PageContainer>
  );
};
