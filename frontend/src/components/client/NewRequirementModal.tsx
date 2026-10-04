import React, { useState } from 'react';
import { RequirementPriority } from '../../types/project';
import { Button } from '../common/Button';
import { X, PlusCircle } from 'lucide-react';

interface NewRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, clipId?: string, priority?: RequirementPriority) => void;
  availableClips?: { id: string; title: string }[];
  currentRole: 'editor' | 'client';
}

export const NewRequirementModal: React.FC<NewRequirementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableClips = [],
  currentRole
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clipId, setClipId] = useState<string>('');
  const [priority, setPriority] = useState<RequirementPriority>('normal');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    onSubmit(title.trim(), description.trim(), clipId || undefined, priority);
    setTitle('');
    setDescription('');
    setClipId('');
    setPriority('normal');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f1011] border border-[#23252a] rounded-[12px] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#23252a]">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-[#e4f222]" />
            <h3 className="text-sm font-semibold text-[#ffffff] tracking-tight">New Requirement / Revision</h3>
          </div>
          <button onClick={onClose} className="text-[#8a8f98] hover:text-[#ffffff] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8a8f98] mb-1">
              Title <span className="text-[#eb5757]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Make hook punchier on Clip 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#08090a] border border-[#23252a] rounded-[6px] px-3 py-2 text-xs text-[#ffffff] placeholder-[#62666d] focus:outline-none focus:border-[#8a8f98]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8a8f98] mb-1">Target Clip</label>
              <select
                value={clipId}
                onChange={(e) => setClipId(e.target.value)}
                className="w-full bg-[#08090a] border border-[#23252a] rounded-[6px] px-3 py-2 text-xs text-[#d0d6e0] focus:outline-none focus:border-[#8a8f98] cursor-pointer"
              >
                <option value="">General Project Requirement</option>
                {availableClips.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id}: {c.title.length > 25 ? c.title.substring(0, 25) + '...' : c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8a8f98] mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as RequirementPriority)}
                className="w-full bg-[#08090a] border border-[#23252a] rounded-[6px] px-3 py-2 text-xs text-[#d0d6e0] focus:outline-none focus:border-[#8a8f98] cursor-pointer"
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="urgent">Urgent / Blocker</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8a8f98] mb-1">
              Detailed Instruction <span className="text-[#eb5757]">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the requested adjustment, timing, or copy change..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#08090a] border border-[#23252a] rounded-[6px] px-3 py-2 text-xs text-[#ffffff] placeholder-[#62666d] focus:outline-none focus:border-[#8a8f98] resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#23252a]">
            <span className="text-[11px] font-mono text-[#62666d]">
              Filing as: <span className="text-[#818cf8] font-semibold">{currentRole === 'client' ? 'Client' : 'Editor'}</span>
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Submit Requirement
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
