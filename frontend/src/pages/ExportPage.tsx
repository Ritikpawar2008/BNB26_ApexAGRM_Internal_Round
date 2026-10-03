import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { MOCK_PROJECT } from '../data/mockData';
import { useProject } from '../hooks/useProject';
import { Clip } from '../types/project';
import { API_BASE_URL, USE_MOCK } from '../services/apiClient';
import { ExportHeader, ExportStatus } from '../components/export/ExportHeader';
import { ExportHero } from '../components/export/ExportHero';
import { ExportPreview, ExportPreviewHandle } from '../components/export/ExportPreview';
import { PlatformSelector, PLATFORMS } from '../components/export/PlatformSelector';
import { AspectFormat, FormatSelector } from '../components/export/FormatSelector';
import { ExportClipList } from '../components/export/ExportClipList';
import { ExportDetails } from '../components/export/ExportDetails';
import { ExportSettings } from '../components/export/ExportSettings';
import { ExportProgress } from '../components/export/ExportProgress';
import { ExportComplete } from '../components/export/ExportComplete';
import { formatSecondsToTime } from '../utils/timeFormatter';
import '../components/studio/studio.css';

const pad = (n: number) => n.toString().padStart(2, '0');

export const ExportPage: React.FC = () => {
  const { id } = useParams();
  const projectId = id || MOCK_PROJECT.id;
  const location = useLocation();
  const { project, loading } = useProject(projectId);

  // Clips from router state (edited in Studio) or fallback to project
  const initialClips = useMemo(() => {
    const passed = (location.state as { clips?: Clip[] })?.clips;
    if (passed && passed.length > 0) return passed;
    if (project?.clips && project.clips.length > 0) {
      return [...project.clips].sort((a, b) => a.position - b.position);
    }
    return MOCK_PROJECT.clips;
  }, [location.state, project]);

  const [clips, setClips] = useState<Clip[]>(initialClips);
  const [selectedId, setSelectedId] = useState<string>(initialClips[0]?.id || 'clip_01');
  const [platform, setPlatform] = useState<string>('instagram');
  const [format, setFormat] = useState<AspectFormat>('9:16');
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>(undefined);

  const previewRef = useRef<ExportPreviewHandle>(null);

  useEffect(() => {
    if (initialClips.length > 0) {
      setClips(initialClips);
      if (!selectedId) setSelectedId(initialClips[0].id);
    }
  }, [initialClips]);

  const selectedIndex = clips.findIndex((c) => c.id === selectedId);
  const selectedClip = selectedIndex >= 0 ? clips[selectedIndex] : clips[0];

  const totalDuration = useMemo(
    () => Math.round(clips.reduce((sum, c) => sum + (c.end_time - c.start_time), 0)),
    [clips]
  );

  const currentPlatform = PLATFORMS.find((p) => p.id === platform) || PLATFORMS[0];

  // Spacebar playback shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.code !== 'Space' || tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'BUTTON') return;
      e.preventDefault();
      // toggle playback
      previewRef.current?.play();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Export pipeline execution
  const startExport = async () => {
    if (status === 'exporting') return;
    setStatus('exporting');
    setProgress(0);

    // Call real backend export endpoint if enabled
    let backendUrl: string | undefined = undefined;
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${API_BASE_URL}/projects/${projectId}/export`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ format, resolution: '1080p' }),
        });
        const json = await res.json();
        if (json.success && json.data?.download_url) {
          backendUrl = json.data.download_url;
        }
      } catch (err) {
        console.warn('Backend export call failed, falling back to client packaging', err);
      }
    }

    // High-resolution realistic progress ticker
    const durationMs = 3800;
    const startTime = performance.now();

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setDownloadUrl(backendUrl);
          setStatus('completed');
        }, 350);
      }
    }, 50);
  };

  const handleResetExport = () => {
    setStatus('idle');
    setProgress(0);
    setDownloadUrl(undefined);
  };

  if (loading || !project) {
    return (
      <div className="studio flex-1 min-w-0 h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center st-fade">
          <p className="st-eyebrow st-pulse">Preparing Export</p>
          <p className="st-display text-[40px] mt-4 text-[var(--st-faint)]">Gathering your cut…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="studio flex-1 min-w-0 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 xl:px-14 pb-28">
        <ExportHeader
          projectId={projectId}
          projectName={project.name}
          status={status}
          clipCount={clips.length}
          onExport={startExport}
        />

        {status === 'exporting' ? (
          <div className="py-24">
            <ExportProgress
              progress={progress}
              format={format}
              clipCount={clips.length}
              platformName={currentPlatform.name}
              durationFormatted={formatSecondsToTime(totalDuration)}
            />
          </div>
        ) : status === 'completed' ? (
          <div className="py-24">
            <ExportComplete
              projectId={projectId}
              clips={clips}
              format={format}
              platformName={currentPlatform.name}
              downloadUrl={downloadUrl}
              onReset={handleResetExport}
            />
          </div>
        ) : (
          <>
            <ExportHero
              clipCount={clips.length}
              totalDuration={totalDuration}
              platformName={currentPlatform.name}
              format={format}
            />

            {/* Main Stage Grid: Media Showcase (Left) + Platform & Sequences (Right) */}
            <section className="grid grid-cols-1 xl:grid-cols-12 gap-12 pt-4 pb-20 items-start">
              {/* Left Column: Polished Media Showcase */}
              <div className="xl:col-span-6 xl:sticky xl:top-6 flex flex-col items-center">
                {selectedClip && (
                  <ExportPreview
                    ref={previewRef}
                    clip={selectedClip}
                    index={selectedIndex + 1}
                    format={format}
                    platform={platform}
                    sourceUrl={project.asset?.url}
                  />
                )}
              </div>

              {/* Right Column: Platform Adaptation & Details */}
              <div className="xl:col-span-6 flex flex-col gap-10">
                <PlatformSelector
                  selectedPlatform={platform}
                  onSelectPlatform={(p) => {
                    setPlatform(p);
                    const cfg = PLATFORMS.find((item) => item.id === p);
                    if (cfg) setFormat(cfg.aspectRecommendation);
                  }}
                />

                <FormatSelector format={format} onSelectFormat={setFormat} />

                <ExportClipList
                  clips={clips}
                  selectedId={selectedClip?.id || clips[0]?.id}
                  onSelectClip={(c) => setSelectedId(c.id)}
                />

                {selectedClip && (
                  <ExportDetails
                    clip={selectedClip}
                    index={selectedIndex + 1}
                  />
                )}

                <ExportSettings format={format} />
              </div>
            </section>

            {/* Bottom Hero CTA Section */}
            <section className="pt-16 border-t st-hairline">
              <button
                type="button"
                onClick={startExport}
                className="group w-full text-left st-surface !rounded-[36px] p-10 md:p-14 flex flex-col md:flex-row md:items-end justify-between gap-10 hover:border-[var(--st-line-strong)] transition-colors duration-500"
              >
                <span>
                  <span className="st-eyebrow block">Ready to Ship · {currentPlatform.name}</span>
                  <span className="st-display block text-[44px] md:text-[72px] mt-5">
                    Export {pad(clips.length)} clips.
                    <br />
                    <span className="text-[var(--st-faint)] group-hover:text-[var(--st-muted)] transition-colors duration-500">
                      Stitched into a {format} master.
                    </span>
                  </span>
                </span>
                <span className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-full bg-[var(--st-text)] text-[var(--st-ink)] flex items-center justify-center transition-all duration-700 group-hover:bg-[#ff5a36] group-hover:rotate-45">
                  <ArrowUpRight className="w-10 h-10" strokeWidth={1.5} />
                </span>
              </button>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
