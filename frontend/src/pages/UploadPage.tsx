import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { ErrorState } from '../components/common/ErrorState';
import { UploadDropzone } from '../components/upload/UploadDropzone';
import { FilePreview } from '../components/upload/FilePreview';
import { UploadProgress } from '../components/upload/UploadProgress';
import { CheckCircle } from 'lucide-react';

// Types for Mock AI Data
export interface ClipRecommendation {
  id: string;
  startTime: number;
  endTime: number;
  title: string;
  reason: string;
  hook: string;
  caption: string;
}

type UploadState = 'IDLE' | 'FILE_SELECTED' | 'UPLOADING' | 'ANALYZING' | 'SUCCESS' | 'ERROR';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<UploadState>('IDLE');
  const [projectName, setProjectName] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [scriptFile, setScriptFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [results, setResults] = useState<ClipRecommendation[] | null>(null);

  const handleVideoSelect = (file: File) => {
    setVideoFile(file);
    if (!projectName) {
      setProjectName(file.name.split('.')[0]); // Default name to filename
    }
    setState('FILE_SELECTED');
  };

  const handleScriptSelect = (file: File) => {
    setScriptFile(file);
  };

  const startAnalysis = async () => {
    if (!videoFile) return;
    
    try {
      setState('UPLOADING');
      setProgress(0);
      
      // Mock upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 150));
        setProgress(i);
      }

      setState('ANALYZING');
      
      // Mock AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock Data (For Frontend demo ONLY)
      const mockResult: ClipRecommendation[] = [
        {
          id: 'clip_1',
          startTime: 32,
          endTime: 48,
          title: "Main AI Concept",
          reason: "High energy moment where core topic is explained",
          hook: "Most people misunderstand AI like this...",
          caption: "This is exactly how neural networks function."
        },
        {
          id: 'clip_2',
          startTime: 95,
          endTime: 120,
          title: "Common Mistake",
          reason: "Direct address to camera with actionable advice",
          hook: "Don't make this mistake when learning AI...",
          caption: "If you only learn prompt engineering, you will fall behind."
        }
      ];

      setResults(mockResult);
      setState('SUCCESS');
      
    } catch (err) {
      setState('ERROR');
      setErrorMsg("An unexpected error occurred during analysis.");
    }
  };

  return (
    <PageContainer 
      title="Create New Project" 
      subtitle="Upload your video content for AI-powered clip analysis."
    >
      <div className="max-w-3xl mx-auto mt-4">
        {/* IDLE / FILE_SELECTED STATE */}
        {(state === 'IDLE' || state === 'FILE_SELECTED') && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Input 
                  label="Project Name" 
                  placeholder="e.g. My Awesome Podcast Ep 12"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Video File</label>
                  {!videoFile ? (
                    <UploadDropzone 
                      onFileSelect={handleVideoSelect} 
                      accept="video/mp4,video/quicktime,video/webm"
                    />
                  ) : (
                    <FilePreview file={videoFile} type="video" onClear={() => {
                      setVideoFile(null);
                      if (!scriptFile) setState('IDLE');
                    }} />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Script / Transcript (Optional)</label>
                  {!scriptFile ? (
                    <UploadDropzone 
                      onFileSelect={handleScriptSelect} 
                      accept=".txt,.md,.srt"
                      label="Upload script"
                      sublabel="Supports TXT, MD, SRT"
                      className="py-6"
                    />
                  ) : (
                    <FilePreview file={scriptFile} type="script" onClear={() => setScriptFile(null)} />
                  )}
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t border-slate-800 pt-6 mt-6">
                <Button 
                  onClick={startAnalysis} 
                  disabled={!videoFile || !projectName.trim()}
                  className="w-full sm:w-auto"
                >
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Analyze with AI
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* UPLOADING STATE */}
        {state === 'UPLOADING' && (
          <Card className="p-12 text-center flex flex-col items-center">
            <h3 className="text-xl font-medium text-white mb-6">Uploading Assets...</h3>
            <UploadProgress progress={progress} className="max-w-md mx-auto" />
          </Card>
        )}

        {/* ANALYZING STATE */}
        {state === 'ANALYZING' && (
          <Card className="p-12 text-center flex flex-col items-center">
            <Loading size="lg" label="AI is analyzing your content. This may take a moment..." />
          </Card>
        )}

        {/* SUCCESS STATE */}
        {state === 'SUCCESS' && (
          <Card className="p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Analysis Complete!</h3>
            <p className="text-slate-400 mb-8 max-w-md">
              We successfully processed "{projectName}" and found {results?.length} viral clip opportunities.
            </p>
            <div className="flex gap-4 w-full max-w-sm justify-center">
              <Button variant="outline" onClick={() => {
                setState('IDLE');
                setVideoFile(null);
                setScriptFile(null);
                setProjectName('');
              }}>
                Start Over
              </Button>
              <Button onClick={() => navigate(`/projects/proj_demo/studio`)}>
                View Results
              </Button>
            </div>
          </Card>
        )}

        {/* ERROR STATE */}
        {state === 'ERROR' && (
          <ErrorState 
            code="UPLOAD_FAILED" 
            message={errorMsg} 
            onRetry={() => setState('FILE_SELECTED')} 
            className="p-10"
          />
        )}
      </div>
    </PageContainer>
  );
};

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);
