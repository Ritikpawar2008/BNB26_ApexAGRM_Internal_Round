import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Loading } from '../components/common/Loading';
import { VideoPlayer } from '../components/studio/VideoPlayer';
import { Timeline } from '../components/studio/Timeline';
import { EditingControls } from '../components/studio/EditingControls';
import { RequirementCard } from '../components/client/RequirementCard';
import { NewRequirementModal } from '../components/client/NewRequirementModal';
import { ProjectWorkLogTimeline } from '../components/client/ProjectWorkLog';
import { ClientReviewSummary } from '../components/client/ClientReviewSummary';
import { projectService } from '../services/projectService';
import { requirementService } from '../services/requirementService';
import { ProjectDetail, Clip, Requirement, ProjectWorkLog, RequirementStatus, RequirementPriority } from '../types/project';
import { Download, Sparkles, LayoutList, GitPullRequest, Plus } from 'lucide-react';


export const StudioPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = id || 'proj_default';

  // Data State
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string>('');
  const [aspectMode, setAspectMode] = useState<'16:9' | '9:16'>('16:9');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Tab & Role State
  const [activeTab, setActiveTab] = useState<'studio' | 'client_hub'>('studio');
  const [currentRole, setCurrentRole] = useState<'editor' | 'client'>('editor');

  // Client Hub State
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [workLogs, setWorkLogs] = useState<ProjectWorkLog[]>([]);
  const [isNewReqModalOpen, setIsNewReqModalOpen] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [reqFilter, setReqFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');

  // Load project, clips, requirements, and logs
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await projectService.getProject(projectId);
        if (mounted && data) {
          setProject(data);
          const projectClips = data.clips || [];
          setClips(projectClips);
          if (projectClips.length > 0) {
            setSelectedClipId(projectClips[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load project details', err);
      } finally {
        if (mounted) setIsLoading(false);
      }

      // Load client hub items
      if (mounted) {
        setRequirements(requirementService.getRequirements(projectId));
        setWorkLogs(requirementService.getWorkLogs(projectId));
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  // Selected clip reference
  const selectedClip = clips.find((c) => c.id === selectedClipId) || clips[0];

  // Clip Modifications Handlers
  const handleUpdateCurrentClip = (updatedFields: Partial<Clip>) => {
    if (!selectedClipId) return;
    setClips((prev) =>
      prev.map((c) => (c.id === selectedClipId ? { ...c, ...updatedFields } : c))
    );
  };

  const handleUpdateClipTime = (clipId: string, start: number, end: number) => {
    setClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, start_time: start, end_time: end } : c))
    );
  };

  const handleToggleSelectClip = (clipId: string) => {
    setClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, is_selected: !c.is_selected } : c))
    );
  };

  const handleMovePosition = (clipId: string, direction: 'earlier' | 'later') => {
    const index = clips.findIndex((c) => c.id === clipId);
    if (index === -1) return;
    const newIndex = direction === 'earlier' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= clips.length) return;

    const newClips = [...clips];
    const [moved] = newClips.splice(index, 1);
    newClips.splice(newIndex, 0, moved);
    setClips(newClips.map((c, idx) => ({ ...c, position: idx })));
  };

  const handleSaveToBackend = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const ok = await projectService.updateClips(projectId, clips);
      if (ok) {
        setSaveMessage('All clips saved to SQLite.');
        requirementService.addWorkLog(
          projectId,
          'editor',
          'Clip Timestamps & Copy Updated',
          `Editor committed changes across ${clips.length} clips.`,
          'Editor Team'
        );
        setWorkLogs(requirementService.getWorkLogs(projectId));
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update clips', err);
      setSaveMessage('Failed to save to database.');
    } finally {
      setIsSaving(false);
    }
  };

  // Requirements & WorkLog Handlers
  const handleCreateRequirement = (
    title: string,
    description: string,
    clipId?: string,
    priority: RequirementPriority = 'normal'
  ) => {
    const authorName = currentRole === 'client' ? 'Alex (Client Lead)' : 'Sarah (Editor)';
    requirementService.createRequirement(
      projectId,
      title,
      description,
      clipId,
      priority,
      currentRole,
      authorName
    );
    setRequirements(requirementService.getRequirements(projectId));
    setWorkLogs(requirementService.getWorkLogs(projectId));
  };

  const handleStatusChange = (reqId: string, status: RequirementStatus) => {
    const actorName = currentRole === 'client' ? 'Client' : 'Editor Team';
    const updated = requirementService.updateRequirementStatus(projectId, reqId, status, actorName);
    setRequirements([...updated]);
    setWorkLogs(requirementService.getWorkLogs(projectId));
  };

  const handleAddComment = (reqId: string, text: string) => {
    const authorName = currentRole === 'client' ? 'Alex (Client)' : 'Sarah (Editor)';
    requirementService.addComment(projectId, reqId, text, currentRole, authorName);
    setRequirements(requirementService.getRequirements(projectId));
  };

  // Computed metrics
  const totalDuration = project?.asset?.duration || 92.5;
  const avgConfidence = clips.length > 0 ? clips.reduce((acc, c) => acc + c.confidence, 0) / clips.length : 0.92;
  const filteredRequirements = requirements.filter((r) => {
    if (reqFilter === 'all') return true;
    return r.status === reqFilter;
  });

  if (isLoading) {
    return (
      <PageContainer title="Loading Studio...">
        <div className="py-20">
          <Loading label="Fetching clips from SQLite and verifying video streams..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={project?.name || 'Creator Studio'}
      subtitle={`Project ID: ${projectId}`}
      action={
        <div className="flex items-center gap-3">
          {/* Role Switcher Pill */}
          <button
            onClick={() => setCurrentRole(currentRole === 'editor' ? 'client' : 'editor')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#161718] border border-[#23252a] hover:border-[#383b3f] text-xs font-mono text-[#d0d6e0] transition-colors"
          >
            <span className="text-[#8a8f98]">Viewing as:</span>
            <span className={currentRole === 'editor' ? 'text-[#e4f222] font-semibold' : 'text-[#02b8cc] font-semibold'}>
              {currentRole === 'editor' ? 'Editor' : 'Client'}
            </span>
          </button>

          {/* Header Action: Export or Analyze */}
          {clips.length > 0 ? (
            <Link to={`/projects/${projectId}/export`}>
              <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                <span>Export Final Video</span>
              </Button>
            </Link>
          ) : (
            <Link to={`/projects/${projectId}/analyze`}>
              <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze with Gemini</span>
              </Button>
            </Link>
          )}
        </div>
      }
    >
      {/* Top Workspace Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#23252a] pb-3 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all ${
              activeTab === 'studio'
                ? 'bg-[#161718] text-[#ffffff] border border-[#23252a] shadow-sm'
                : 'text-[#8a8f98] hover:text-[#d0d6e0]'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'studio' ? 'text-[#e4f222]' : 'text-[#62666d]'}`} />
            <span>Interactive Video Studio</span>
            <Badge variant="neutral" text={`${clips.length} clips`} />
          </button>

          <button
            onClick={() => setActiveTab('client_hub')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all ${
              activeTab === 'client_hub'
                ? 'bg-[#161718] text-[#ffffff] border border-[#23252a] shadow-sm'
                : 'text-[#8a8f98] hover:text-[#d0d6e0]'
            }`}
          >
            <GitPullRequest className={`w-3.5 h-3.5 ${activeTab === 'client_hub' ? 'text-[#02b8cc]' : 'text-[#62666d]'}`} />
            <span>Client Requirements & Work Log</span>
            <Badge
              variant={requirements.filter((r) => r.status === 'open').length > 0 ? 'warning' : 'neutral'}
              text={`${requirements.length}`}
            />
          </button>
        </div>

        {saveMessage && (
          <span className="text-xs font-mono text-[#27a644] animate-in fade-in duration-200">
            ✓ {saveMessage}
          </span>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INTERACTIVE VIDEO STUDIO (EDITOR SUITE)                           */}
      {/* ========================================================================= */}
      {activeTab === 'studio' && (
        clips.length === 0 ? (
          <Card className="p-10 border-dashed border-[#23252a] bg-[#0f1011] space-y-6 max-w-2xl mx-auto my-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#161718] border border-[#23252a] flex items-center justify-center mx-auto text-[#e4f222]">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-[#ffffff]">
                {project?.status === 'uploaded' ? 'Video Uploaded — Ready for AI Analysis' : 'No Clips Generated Yet'}
              </h3>
              <p className="text-xs text-[#8a8f98] max-w-md mx-auto leading-relaxed">
                {project?.status === 'uploaded'
                  ? 'Your source video file has been successfully uploaded to storage. Run Gemini 2.5 multimodal analysis to automatically detect high-retention segments, extract clips, and generate hooks.'
                  : 'No viral clips were detected or saved for this project yet. You can run the Gemini AI analysis to scan the video and create timestamped clips.'}
              </p>
            </div>

            {project?.asset?.url && (
              <div className="max-w-md mx-auto rounded-lg overflow-hidden border border-[#23252a] bg-[#000000]">
                <video
                  src={project.asset.url}
                  controls
                  className="w-full max-h-56 object-contain"
                />
                <div className="p-2 text-left bg-[#161718] border-t border-[#23252a] flex items-center justify-between text-[11px] font-mono text-[#8a8f98]">
                  <span className="truncate">{project.asset.filename || 'Uploaded Source Video'}</span>
                  <span>{project.asset.duration ? `${project.asset.duration.toFixed(1)}s` : ''}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link to={`/projects/${projectId}/analyze`}>
                <Button variant="primary" size="md" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>⚡ Analyze Video with Gemini</span>
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="secondary" size="md">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: AI Recommendations List (3 cols) */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-xs font-semibold text-[#ffffff] uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <LayoutList className="w-3.5 h-3.5 text-[#e4f222]" />
                    AI Moments Detected
                  </h3>
                  <span className="text-[11px] font-mono text-[#62666d]">Gemini 2.5</span>
                </div>

                {clips.map((clip) => {
                  const isSelected = selectedClipId === clip.id;
                  return (
                    <Card
                      key={clip.id}
                      onClick={() => setSelectedClipId(clip.id)}
                      className={`p-3.5 cursor-pointer border transition-all ${
                        isSelected
                          ? 'border-[#e4f222] bg-[#161718]'
                          : 'border-[#23252a] bg-[#0f1011] hover:border-[#383b3f]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-medium text-xs text-[#ffffff] truncate max-w-[180px]">
                          {clip.title}
                        </span>
                        <Badge
                          variant={clip.confidence >= 0.9 ? 'success' : 'neutral'}
                          text={`${Math.round(clip.confidence * 100)}%`}
                        />
                      </div>
                      {clip.reason && <p className="text-[11px] text-[#8a8f98] line-clamp-2 mb-2">{clip.reason}</p>}
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#62666d]">
                        <span>
                          {clip.start_time.toFixed(1)}s - {clip.end_time.toFixed(1)}s
                        </span>
                        <span className="text-[#e4f222]">
                          {(clip.end_time - clip.start_time).toFixed(1)}s
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Center + Right Columns (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Synchronized Video Player */}
                {selectedClip && (
                  <VideoPlayer
                    src={selectedClip.url || project?.asset?.url}
                    startTime={selectedClip.start_time}
                    endTime={selectedClip.end_time}
                    aspectMode={aspectMode}
                    onAspectChange={setAspectMode}
                    title={selectedClip.title}
                  />
                )}

                {/* Hook & Caption Editor */}
                {selectedClip && (
                  <EditingControls
                    clip={selectedClip}
                    onUpdate={handleUpdateCurrentClip}
                    onSaveToBackend={handleSaveToBackend}
                    isSaving={isSaving}
                    currentRole={currentRole}
                    onRequestRevisionForClip={() => {
                      setIsNewReqModalOpen(true);
                    }}
                  />
                )}
              </div>
            </div>

            {/* Bottom Full-Width Timeline Sequencer & Trimmer */}
            <Timeline
              clips={clips}
              selectedId={selectedClipId}
              onSelectClip={setSelectedClipId}
              onUpdateClipTime={handleUpdateClipTime}
              onToggleSelect={handleToggleSelectClip}
              onMovePosition={handleMovePosition}
              currentRole={currentRole}
            />
          </div>
        )
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GITHUB-STYLE CLIENT REQUIREMENTS & WORK LOG HUB                    */}
      {/* ========================================================================= */}
      {activeTab === 'client_hub' && (
        <div className="space-y-6">
          {/* Executive Client Review Summary Banner */}
          <ClientReviewSummary
            totalDuration={totalDuration}
            clipsCount={clips.length}
            avgConfidence={avgConfidence}
            isApproved={isApproved}
            onApprove={() => setIsApproved(true)}
            onRequestRevision={() => setIsNewReqModalOpen(true)}
            currentRole={currentRole}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Requirements & Revisions Board (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#23252a]">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#ffffff] tracking-tight">Requirements & Feedback</h3>
                  <Badge variant="neutral" text={`${filteredRequirements.length} tickets`} />
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Filter */}
                  <select
                    value={reqFilter}
                    onChange={(e) => setReqFilter(e.target.value as any)}
                    className="bg-[#161718] border border-[#23252a] text-[#8a8f98] text-xs rounded-[6px] px-2.5 py-1 focus:outline-none focus:border-[#8a8f98] font-mono cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <Button variant="primary" size="sm" onClick={() => setIsNewReqModalOpen(true)}>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>New Ticket</span>
                  </Button>
                </div>
              </div>

              {filteredRequirements.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#23252a] rounded-[8px] bg-[#0f1011]">
                  <p className="text-xs text-[#8a8f98] font-mono">No requirements match this filter.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRequirements.map((req) => (
                    <RequirementCard
                      key={req.id}
                      requirement={req}
                      currentRole={currentRole}
                      onStatusChange={handleStatusChange}
                      onAddComment={handleAddComment}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Git-Style Activity Log Timeline (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#23252a]">
                <h3 className="text-sm font-semibold text-[#ffffff] tracking-tight">Project Working Log</h3>
                <span className="text-[11px] font-mono text-[#62666d]">Audit Trail</span>
              </div>

              <ProjectWorkLogTimeline logs={workLogs} />
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Requirement */}
      <NewRequirementModal
        isOpen={isNewReqModalOpen}
        onClose={() => setIsNewReqModalOpen(false)}
        onSubmit={handleCreateRequirement}
        availableClips={clips.map((c) => ({ id: c.id, title: c.title }))}
        currentRole={currentRole}
      />
    </PageContainer>
  );
};
