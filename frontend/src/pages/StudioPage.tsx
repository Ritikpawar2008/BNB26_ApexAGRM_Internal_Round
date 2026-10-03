import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Clip } from '../types/project';
import { ROUTES } from '../constants/routes';
import { MOCK_PROJECT } from '../data/mockData';
import { projectService } from '../services/projectService';
import { useProject } from '../hooks/useProject';
import { useVideoPlayback } from '../hooks/useVideoPlayback';
import { StudioHeader, SaveState } from '../components/studio/StudioHeader';
import { StudioHero } from '../components/studio/StudioHero';
import { VideoPlayer, VideoPlayerHandle, PreviewFrame } from '../components/studio/VideoPlayer';
import { AIRecommendationPanel } from '../components/studio/AIRecommendationPanel';
import { Timeline } from '../components/studio/Timeline';
import { EditingControls } from '../components/studio/EditingControls';
import { StudioButton } from '../components/studio/StudioButton';
import '../components/studio/studio.css';

type PlaybackMode = 'free' | 'clip' | 'sequence';

const pad = (n: number) => n.toString().padStart(2, '0');
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Re-stamp `position` so it always matches the array order sent to the API. */
const withPositions = (clips: Clip[]) => clips.map((c, i) => ({ ...c, position: i }));

export const StudioPage: React.FC = () => {
  const { id } = useParams();
  const projectId = id ?? MOCK_PROJECT.id;
  const navigate = useNavigate();
  const { project, loading } = useProject(projectId);

  // ---- Studio state (owned here, rendered by presentational components) ----
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [frame, setFrame] = useState<PreviewFrame>('source');
  const [mode, setMode] = useState<PlaybackMode>('free');
  const [saveState, setSaveState] = useState<SaveState>('clean');
  const { currentTime, setCurrentTime, isPlaying, setIsPlaying } = useVideoPlayback();
  const originals = useRef<Record<string, Clip>>({});
  const playerRef = useRef<VideoPlayerHandle>(null);

  useEffect(() => {
    if (!project) return;
    const ordered = withPositions([...project.clips].sort((a, b) => a.position - b.position));
    originals.current = Object.fromEntries(ordered.map((c) => [c.id, c]));
    setClips(ordered);
    setSelectedId(ordered[0]?.id);
    setSaveState('clean');
  }, [project]);

  const sourceDuration = useMemo(
    () => project?.asset?.duration || Math.max(0, ...clips.map((c) => c.end_time)) || 1,
    [project, clips]
  );
  const selectedIndex = clips.findIndex((c) => c.id === selectedId);
  const selectedClip = selectedIndex >= 0 ? clips[selectedIndex] : undefined;

  // ---- Actions ----
  const selectClip = useCallback((clip: Clip) => {
    setMode('free');
    setSelectedId(clip.id);
    playerRef.current?.seek(clip.start_time);
  }, []);

  const previewClip = useCallback((clip: Clip) => {
    setSelectedId(clip.id);
    setMode('clip');
    playerRef.current?.seek(clip.start_time);
    playerRef.current?.play();
  }, []);

  const playSequence = () => {
    if (!clips.length) return;
    setSelectedId(clips[0].id);
    setMode('sequence');
    playerRef.current?.seek(clips[0].start_time);
    playerRef.current?.play();
  };

  const updateSelected = (patch: Partial<Pick<Clip, 'hook' | 'caption'>>) => {
    if (!selectedId) return;
    setClips((prev) => prev.map((c) => (c.id === selectedId ? { ...c, ...patch } : c)));
    setSaveState('dirty');
  };

  const reorder = (from: number, to: number) => {
    if (from === to || to < 0 || to >= clips.length) return;
    setClips((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return withPositions(next);
    });
    setSaveState('dirty');
  };

  const save = async (): Promise<boolean> => {
    setSaveState('saving');
    try {
      const [ok] = await Promise.all([projectService.updateClips(projectId, withPositions(clips)), wait(450)]);
      setSaveState(ok ? 'saved' : 'dirty');
      return ok;
    } catch {
      setSaveState('dirty');
      return false;
    }
  };

  const continueToExport = async () => {
    playerRef.current?.pause();
    if (saveState === 'dirty') await save();
    // Hand the edited sequence forward so Export reflects edits even while USE_MOCK is on.
    navigate(ROUTES.EXPORT(projectId), { state: { clips: withPositions(clips) } });
  };

  // ---- Playback rules: clip preview stops at its end, sequence preview chains clips ----
  const handleTimeUpdate = (t: number) => {
    setCurrentTime(t);
    if (!isPlaying || !selectedClip) {
      if (t >= sourceDuration) playerRef.current?.pause();
      return;
    }
    if (mode === 'clip' && t >= selectedClip.end_time) {
      playerRef.current?.pause();
      setMode('free');
    } else if (mode === 'sequence' && t >= selectedClip.end_time) {
      const next = clips[selectedIndex + 1];
      if (next) {
        setSelectedId(next.id);
        playerRef.current?.seek(next.start_time);
      } else {
        playerRef.current?.pause();
        setMode('free');
      }
    } else if (t >= sourceDuration) {
      playerRef.current?.pause();
    }
  };

  const handlePlayingChange = (playing: boolean) => {
    setIsPlaying(playing);
    if (!playing) setMode('free');
  };

  // Space bar toggles playback (unless the creator is typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.code !== 'Space' || tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'BUTTON') return;
      e.preventDefault();
      if (isPlaying) playerRef.current?.pause();
      else playerRef.current?.play();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPlaying]);

  const playbackLabel =
    mode === 'sequence'
      ? `Previewing sequence · ${pad(selectedIndex + 1)}/${pad(clips.length)}`
      : mode === 'clip'
      ? `Previewing clip ${pad(selectedIndex + 1)}`
      : undefined;

  // ---- Render ----
  if (loading || !project) {
    return (
      <div className="studio flex-1 min-w-0 h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center st-fade">
          <p className="st-eyebrow st-pulse">Opening studio</p>
          <p className="st-display text-[40px] mt-4 text-[var(--st-faint)]">Gathering your moments…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="studio flex-1 min-w-0 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 xl:px-14 pb-24">
        <StudioHeader projectName={project.name} saveState={saveState} onSave={save} onExport={continueToExport} />

        <StudioHero
          filename={project.asset?.filename}
          sourceDuration={sourceDuration}
          momentCount={clips.length}
        />

        {clips.length === 0 ? (
          <section className="py-24 border-t st-hairline text-center">
            <p className="st-eyebrow">No moments yet</p>
            <p className="st-display text-[40px] mt-4 text-[var(--st-muted)]">
              CreatorAI hasn’t found clips in this video yet.
            </p>
            <StudioButton className="mt-10" onClick={() => navigate(ROUTES.ANALYSIS(projectId))}>
              Run analysis
            </StudioButton>
          </section>
        ) : (
          <>
            {/* Workspace: player + AI discovery */}
            <section className="grid grid-cols-1 xl:grid-cols-12 gap-x-12 gap-y-14 pb-16 st-rise" style={{ animationDelay: '120ms' }}>
              <div className="xl:col-span-8 xl:sticky xl:top-6 self-start">
                <VideoPlayer
                  ref={playerRef}
                  src={project.asset?.url}
                  sourceDuration={sourceDuration}
                  clips={clips}
                  selectedClip={selectedClip}
                  selectedIndex={selectedIndex + 1}
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  frame={frame}
                  playbackLabel={playbackLabel}
                  onFrameChange={setFrame}
                  onTimeUpdate={handleTimeUpdate}
                  onPlayingChange={handlePlayingChange}
                  onPlaySequence={playSequence}
                />
              </div>
              <div className="xl:col-span-4">
                <AIRecommendationPanel
                  clips={clips}
                  selectedId={selectedId}
                  onSelect={selectClip}
                  onPreview={previewClip}
                />
              </div>
            </section>

            <Timeline
              clips={clips}
              selectedId={selectedId}
              sourceDuration={sourceDuration}
              currentTime={currentTime}
              onSelectClip={selectClip}
              onSeek={(t) => {
                setMode('free');
                playerRef.current?.seek(t);
              }}
              onReorder={reorder}
            />

            {selectedClip && (
              <EditingControls
                clip={selectedClip}
                index={selectedIndex + 1}
                original={originals.current[selectedClip.id]}
                onUpdate={updateSelected}
              />
            )}

            {/* Closing statement — the obvious next step */}
            <section className="pt-16 border-t st-hairline">
              <button
                type="button"
                onClick={continueToExport}
                className="group w-full text-left st-surface !rounded-[36px] p-10 md:p-14 flex flex-col md:flex-row md:items-end justify-between gap-10 hover:border-[var(--st-line-strong)] transition-colors duration-500"
              >
                <span>
                  <span className="st-eyebrow block">Next · Export</span>
                  <span className="st-display block text-[44px] md:text-[72px] mt-5">
                    {pad(clips.length)} clips ready.
                    <br />
                    <span className="text-[var(--st-faint)] group-hover:text-[var(--st-muted)] transition-colors duration-500">
                      Adapt them for every platform.
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
