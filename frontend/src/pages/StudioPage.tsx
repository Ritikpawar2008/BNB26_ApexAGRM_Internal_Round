import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { MOCK_PROJECT } from '../data/mockData';
import { Download, Play, Sparkles } from 'lucide-react';

export const StudioPage: React.FC = () => {
  const [selectedClip, setSelectedClip] = useState(MOCK_PROJECT.clips[0]);

  return (
    <PageContainer
      title={MOCK_PROJECT.name}
      subtitle="Creator Studio: Review, edit hooks, reorder clips, and export"
      action={
        <Link to={`/projects/${MOCK_PROJECT.id}/export`}>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Video
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Clips List */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" /> AI Recommendations
          </h2>
          {MOCK_PROJECT.clips.map((clip) => (
            <Card
              key={clip.id}
              onClick={() => setSelectedClip(clip)}
              className={`${selectedClip.id === clip.id ? 'border-indigo-500 bg-slate-800/90' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white text-sm">{clip.title}</span>
                <Badge variant="success" text={`${Math.round(clip.confidence * 100)}% Match`} />
              </div>
              <p className="text-xs text-slate-400 mb-2">{clip.reason}</p>
              <div className="text-xs font-mono text-indigo-400">
                {clip.start_time}s - {clip.end_time}s ({clip.end_time - clip.start_time}s)
              </div>
            </Card>
          ))}
        </div>

        {/* Center: Video Preview */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0 overflow-hidden bg-black flex flex-col items-center justify-center min-h-[350px]">
            <video
              src={selectedClip.url}
              controls
              className="w-full max-h-[420px] rounded-lg"
            />
          </Card>

          {/* Hook & Caption Editor */}
          <Card>
            <h3 className="text-sm font-semibold text-white mb-2">Selected Clip Hook & Caption</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Opening Verbal Hook</label>
                <input
                  type="text"
                  defaultValue={selectedClip.hook}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Social Media Caption</label>
                <textarea
                  defaultValue={selectedClip.caption}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
