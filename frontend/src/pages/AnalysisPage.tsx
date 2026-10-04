import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { projectService } from '../services/projectService';
import { requirementService } from '../services/requirementService';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';


export const AnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = id || 'proj_default';

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const runAnalysis = async () => {
      setIsProcessing(true);
      setErrorMessage(null);

      // Step 1: Video File Probed
      setCurrentStep(1);
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Gemini AI Analysis
      if (mounted) setCurrentStep(2);

      try {
        const result = await projectService.analyzeProject(projectId);

        if (mounted) {
          // Step 3: FFmpeg extraction
          setCurrentStep(3);
          await new Promise((r) => setTimeout(r, 600));

          // Step 4: Complete
          setCurrentStep(4);
          setSummary(result.summary);

          // Append work log entry
          requirementService.addWorkLog(
            projectId,
            'ai',
            'Gemini AI Video Understanding Complete',
            result.summary || 'Multimodal analysis extracted viral clips.',
            'Gemini 2.5 Flash'
          );

          // Auto-navigate to studio after short pause
          setTimeout(() => {
            navigate(`/projects/${projectId}/studio`);
          }, 1200);
        }
      } catch (err: any) {
        console.error('Video analysis failed', err);
        if (mounted) {
          setErrorMessage(err.message || 'Analysis encountered an error.');
          setIsProcessing(false);
        }
      }
    };

    runAnalysis();

    return () => {
      mounted = false;
    };
  }, [projectId, navigate]);

  const steps = [
    { num: 1, title: 'Validating Video Container & Audio', desc: 'Probing duration, framerate, and audio track via FFmpeg' },
    { num: 2, title: 'Gemini 2.5 Flash Multimodal Analysis', desc: 'Detecting high-retention segments, aha moments, and viral hooks' },
    { num: 3, title: 'FFmpeg Sub-Clip Extraction', desc: 'Cutting native segments and writing MP4 containers to storage' },
    { num: 4, title: 'Finalizing Structured Recommendations', desc: 'Writing hooks, captions, and confidence scores to SQLite' },
  ];

  return (
    <PageContainer title="AI Video Analysis" subtitle={`Analyzing Project: ${projectId}`}>
      <div className="max-w-xl mx-auto py-6 space-y-6">
        <Card className="p-6 bg-[#0f1011] border-[#23252a] space-y-6">
          {/* Animated Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#161718] border border-[#23252a] flex items-center justify-center mx-auto text-[#e4f222]">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-base font-semibold text-[#ffffff] tracking-tight">
              {isProcessing ? 'AI Multimodal Understanding in Progress...' : 'Analysis Paused'}
            </h2>
            <p className="text-xs text-[#8a8f98]">
              Google Gemini is extracting the most engaging clips, hooks, and captions.
            </p>
          </div>

          {/* Stepper */}
          <div className="space-y-4 pt-2">
            {steps.map((s) => {
              const isDone = currentStep > s.num;
              const isCurrent = currentStep === s.num && isProcessing;

              return (
                <div
                  key={s.num}
                  className={`flex items-start gap-3.5 p-3 rounded-[8px] border transition-all duration-200 ${
                    isCurrent
                      ? 'bg-[#161718] border-[#e4f222]/40 text-[#ffffff]'
                      : isDone
                      ? 'bg-[#0f1011] border-[#23252a] text-[#d0d6e0]'
                      : 'bg-[#08090a] border-transparent text-[#62666d]'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-[#27a644]" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#23252a] border-t-[#e4f222] animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#23252a] flex items-center justify-center text-[10px] font-mono">
                        {s.num}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className={`text-xs font-medium ${isCurrent ? 'text-[#e4f222]' : isDone ? 'text-[#ffffff]' : 'text-[#62666d]'}`}>
                      {s.title}
                    </h4>
                    <p className="text-[11px] text-[#8a8f98] mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Preview */}
          {summary && (
            <div className="p-3 bg-[#161718] border border-[#23252a] rounded-[8px] text-xs text-[#8a8f98] italic animate-in fade-in">
              "{summary}"
            </div>
          )}

          {/* Error Message & Recovery */}
          {errorMessage && (
            <div className="p-4 rounded-[8px] bg-[#eb5757]/10 border border-[#eb5757]/20 space-y-3">
              <div className="flex items-center gap-2 text-xs text-[#eb5757]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/projects/${projectId}/studio`)}
                >
                  Skip to Studio
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Retry Analysis
                </Button>
              </div>
            </div>
          )}

          {/* Direct Proceed Button when done */}
          {currentStep === 4 && (
            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/projects/${projectId}/studio`)}
                className="flex items-center gap-1.5"
              >
                <span>Opening Creator Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
};
