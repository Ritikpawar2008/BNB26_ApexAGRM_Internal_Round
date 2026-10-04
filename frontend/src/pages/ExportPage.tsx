import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Loading } from '../components/common/Loading';
import { projectService, ExportResponse } from '../services/projectService';
import { requirementService } from '../services/requirementService';
import { ProjectDetail } from '../types/project';
import { Download, CheckCircle2, ArrowLeft, Smartphone, Monitor, Copy, Check, Sparkles } from 'lucide-react';

export const ExportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = id || 'proj_default';

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [format, setFormat] = useState<'9:16' | '16:9'>('9:16');
  const [resolution, setResolution] = useState<'1080p' | '720p'>('1080p');
  const [isExporting, setIsExporting] = useState(false);
  const [exportData, setExportData] = useState<ExportResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    projectService.getProject(projectId).then((p) => {
      setProject(p);
    });
  }, [projectId]);

  const handleStartExport = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    try {
      const result = await projectService.exportProject(projectId, format, resolution);
      setExportData(result);

      // Log export event to work log
      requirementService.addWorkLog(
        projectId,
        'export',
        `Final Video Exported (${format})`,
        `FFmpeg stitched selected clips into ${format} format. Total runtime: ${result.total_duration}s.`,
        'FFmpeg Concat Engine'
      );
    } catch (err: any) {
      console.error('Export failed', err);
      setErrorMessage(err.message || 'Export failed. Ensure clips are valid.');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedClips = project?.clips?.filter((c) => c.is_selected) || project?.clips || [];
  const estDuration = selectedClips.reduce((acc, c) => acc + Math.max(0, c.end_time - c.start_time), 0);

  const handleCopyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <PageContainer
      title="Export Deliverables"
      subtitle={`Project: ${project?.name || projectId}`}
      action={
        <Link to={`/projects/${projectId}/studio`}>
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Studio</span>
          </Button>
        </Link>
      }
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {!exportData ? (
          /* Configuration Card */
          <Card className="p-6 bg-[#0f1011] border-[#23252a] space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[#ffffff] tracking-tight mb-1">
                Configure Export Settings
              </h3>
              <p className="text-xs text-[#8a8f98]">
                Stitch all selected clips into a final compilation using the FFmpeg concat engine.
              </p>
            </div>

            {/* Format Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#8a8f98]">Target Format / Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat('9:16')}
                  className={`flex items-start gap-3 p-3.5 rounded-[8px] border text-left transition-all ${
                    format === '9:16'
                      ? 'bg-[#161718] border-[#e4f222] text-[#ffffff]'
                      : 'bg-[#08090a] border-[#23252a] text-[#8a8f98] hover:border-[#383b3f]'
                  }`}
                >
                  <Smartphone className={`w-5 h-5 mt-0.5 ${format === '9:16' ? 'text-[#e4f222]' : 'text-[#62666d]'}`} />
                  <div>
                    <div className="text-xs font-medium text-[#ffffff]">9:16 Vertical Short</div>
                    <div className="text-[11px] text-[#8a8f98] mt-0.5">Optimized for TikTok, Reels & Shorts</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('16:9')}
                  className={`flex items-start gap-3 p-3.5 rounded-[8px] border text-left transition-all ${
                    format === '16:9'
                      ? 'bg-[#161718] border-[#e4f222] text-[#ffffff]'
                      : 'bg-[#08090a] border-[#23252a] text-[#8a8f98] hover:border-[#383b3f]'
                  }`}
                >
                  <Monitor className={`w-5 h-5 mt-0.5 ${format === '16:9' ? 'text-[#e4f222]' : 'text-[#62666d]'}`} />
                  <div>
                    <div className="text-xs font-medium text-[#ffffff]">16:9 Widescreen</div>
                    <div className="text-[11px] text-[#8a8f98] mt-0.5">Standard YouTube & Desktop format</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Resolution Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#8a8f98]">Resolution Quality</label>
              <div className="flex gap-2">
                {(['1080p', '720p'] as const).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setResolution(res)}
                    className={`px-3 py-1.5 rounded-[6px] text-xs font-mono transition-colors ${
                      resolution === res
                        ? 'bg-[#161718] text-[#e4f222] border border-[#e4f222]'
                        : 'bg-[#08090a] text-[#8a8f98] border border-[#23252a] hover:border-[#383b3f]'
                    }`}
                  >
                    {res === '1080p' ? '1080p Full HD (Recommended)' : '720p Fast Render'}
                  </button>
                ))}
              </div>
            </div>


            {/* Sequence Summary */}
            <div className="p-3.5 rounded-[8px] bg-[#161718] border border-[#23252a] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8a8f98]">Clips to Stitch:</span>
                <span className="font-mono text-[#ffffff]">{selectedClips.length} clips in order</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8a8f98]">Estimated Output Runtime:</span>
                <span className="font-mono text-[#e4f222] font-semibold">{estDuration.toFixed(1)}s</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8a8f98]">Encoding:</span>
                <span className="font-mono text-[#d0d6e0]">H.264 / AAC (CRF 22 Faststart)</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-[6px] bg-[#eb5757]/10 border border-[#eb5757]/20 text-[#eb5757] text-xs">
                {errorMessage}
              </div>
            )}

            {isExporting ? (
              <div className="py-6">
                <Loading label="Stitching video clips via FFmpeg concat engine..." />
              </div>
            ) : (
              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartExport}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Render & Stitch Video</span>
                </Button>
              </div>
            )}
          </Card>
        ) : (
          /* Rendered Deliverable Player Card */
          <Card className="p-6 bg-[#0f1011] border-[#23252a] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
              <div className="flex items-center gap-2 text-[#27a644]">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-sm font-semibold text-[#ffffff] tracking-tight">
                  Export Ready for Download
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" text={format} />
                <Badge variant="neutral" text={`${exportData.total_duration}s`} />
              </div>
            </div>

            {/* Video Player */}
            <div className="bg-black rounded-[8px] overflow-hidden border border-[#23252a] flex items-center justify-center max-h-[440px]">
              <video
                src={exportData.download_url}
                controls
                autoPlay
                className="max-h-[440px] w-full object-contain"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={exportData.download_url}
                download={`${projectId}_final_export.mp4`}
                className="w-full sm:flex-1"
              >
                <Button variant="primary" size="md" className="w-full flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Download Stitched MP4</span>
                </Button>
              </a>

              <Button
                variant="outline"
                size="md"
                onClick={handleCopyShareLink}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                {copiedLink ? <Check className="w-4 h-4 text-[#27a644]" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied' : 'Share Review Link'}</span>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};
