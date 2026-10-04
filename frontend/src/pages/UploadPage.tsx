import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { projectService } from '../services/projectService';
import { UploadCloud, FileVideo, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projectName, setProjectName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setErrorMessage(null);
    const validExtensions = ['mp4', 'mov', 'webm', 'mkv', 'avi'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !validExtensions.includes(ext)) {
      setErrorMessage(`Invalid video format (.${ext}). Supported formats: MP4, MOV, WebM.`);
      return;
    }

    if (file.size > 200 * 1024 * 1024) {
      setErrorMessage('File exceeds the 200MB limit. Please upload a smaller video.');
      return;
    }

    setSelectedFile(file);
    if (!projectName.trim()) {
      // Auto-populate project name from filename
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setProjectName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleStartUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a video file to upload.');
      return;
    }
    if (!projectName.trim()) {
      setErrorMessage('Please provide a project name.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadProgress(15);

    try {
      // 1. Create Project
      const project = await projectService.createProject(projectName.trim());
      setUploadProgress(40);

      // 2. Upload Video File
      await projectService.uploadVideo(project.id, selectedFile);
      setUploadProgress(100);

      // 3. Navigate to Analysis Page
      setTimeout(() => {
        navigate(`/projects/${project.id}/analysis`);
      }, 500);
    } catch (err: any) {
      console.error('Upload flow failed', err);
      setErrorMessage(err.message || 'Video upload failed. Check backend connection.');
      setIsUploading(false);
    }
  };

  return (
    <PageContainer title="New Project" subtitle="Upload long-form video to automatically extract viral short clips">
      <div className="max-w-2xl mx-auto space-y-6">
        <form onSubmit={handleStartUpload} className="space-y-6">
          {/* Project Name Card */}
          <Card className="p-5 space-y-3 bg-[#0f1011] border-[#23252a]">
            <label className="block text-xs font-medium text-[#8a8f98]">
              Project Name <span className="text-[#eb5757]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Explaining Attention Mechanisms"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-[#08090a] border border-[#23252a] rounded-[6px] px-3.5 py-2 text-sm text-[#ffffff] placeholder-[#62666d] focus:outline-none focus:border-[#8a8f98] font-sans"
            />
          </Card>

          {/* Drag & Drop File Ingestion Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[12px] p-10 text-center transition-all duration-150 ${
              isDragging
                ? 'border-[#e4f222] bg-[#e4f222]/5'
                : selectedFile
                ? 'border-[#23252a] bg-[#0f1011]'
                : 'border-[#23252a] hover:border-[#383b3f] bg-[#0f1011] cursor-pointer'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedFile ? (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#161718] border border-[#23252a] flex items-center justify-center mx-auto text-[#e4f222]">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#ffffff] tracking-tight">
                    Drag and drop your raw video here
                  </h3>
                  <p className="text-xs text-[#8a8f98] mt-1">or click to browse from your computer</p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Badge variant="neutral" text="MP4" />
                  <Badge variant="neutral" text="MOV" />
                  <Badge variant="neutral" text="WebM" />
                  <span className="text-[11px] text-[#62666d] font-mono">• Up to 200MB</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-[#161718] border border-[#23252a] rounded-[8px]">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-[6px] bg-[#08090a] border border-[#23252a] flex items-center justify-center text-[#e4f222]">
                    <FileVideo className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-[#ffffff] truncate max-w-sm">{selectedFile.name}</h4>
                    <span className="text-[11px] font-mono text-[#8a8f98]">
                      {(selectedFile.size / 1024 / 1024).toFixed(1)} MB • {selectedFile.type || 'video/mp4'}
                    </span>
                  </div>
                </div>

                {!isUploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="p-1.5 rounded text-[#8a8f98] hover:text-[#eb5757] hover:bg-[#23252a] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="p-4 bg-[#0f1011] border border-[#23252a] rounded-[8px] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#d0d6e0] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#e4f222] animate-pulse" />
                  Uploading video to FastAPI backend...
                </span>
                <span className="text-[#e4f222] font-semibold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#161718] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#e4f222] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-[6px] bg-[#eb5757]/10 border border-[#eb5757]/20 text-[#eb5757] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={!selectedFile || isUploading}
              isLoading={isUploading}
              className="w-full sm:w-auto"
            >
              Upload & Proceed to AI Analysis
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};
