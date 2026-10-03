import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { UploadCloud, Plus, Settings, Video } from 'lucide-react';

export const QuickActions: React.FC = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        <Link to="/projects/new">
          <Button variant="primary" className="w-full flex items-center justify-center gap-2 py-6">
            <UploadCloud className="w-5 h-5" />
            Upload Video
          </Button>
        </Link>
        <Link to="/projects/new">
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2 py-6 border border-slate-700">
            <Plus className="w-5 h-5" />
            New Project
          </Button>
        </Link>
      </div>
      
      <div className="mt-6 flex flex-col gap-2">
        <Button variant="ghost" className="justify-start text-slate-300">
          <Video className="w-4 h-4 mr-3" />
          View All Projects
        </Button>
        <Button variant="ghost" className="justify-start text-slate-300">
          <Settings className="w-4 h-4 mr-3" />
          Dashboard Settings
        </Button>
      </div>
    </Card>
  );
};
