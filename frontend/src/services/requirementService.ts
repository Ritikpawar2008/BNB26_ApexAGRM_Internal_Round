import { Requirement, ProjectWorkLog, RequirementComment } from '../types/project';

const REQ_STORAGE_PREFIX = 'creatorai_requirements_';
const LOG_STORAGE_PREFIX = 'creatorai_worklogs_';

export const requirementService = {
  getRequirements: (projectId: string): Requirement[] => {
    try {
      const stored = localStorage.getItem(`${REQ_STORAGE_PREFIX}${projectId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error loading requirements from storage', e);
    }

    // Default Seed Requirements for demonstration
    const initial: Requirement[] = [
      {
        id: 'REQ-01',
        projectId,
        title: 'Make opening hook punchier and reference ChatGPT',
        description: 'The first 3 seconds are too technical. We need an aggressive scroll-stopper question about ChatGPT training.',
        clipId: 'clip_01',
        status: 'resolved',
        priority: 'urgent',
        author: 'client',
        authorName: 'Alex (Client Lead)',
        comments: [
          {
            id: 'c1',
            requirementId: 'REQ-01',
            author: 'client',
            authorName: 'Alex (Client Lead)',
            content: 'Can we mention ChatGPT in the first line?',
            createdAt: '10:20 AM'
          },
          {
            id: 'c2',
            requirementId: 'REQ-01',
            author: 'editor',
            authorName: 'Sarah (Video Editor)',
            content: 'Updated opening verbal hook: "Stop training recurrent networks! Here is why transformers changed everything." Check preview.',
            createdAt: '10:28 AM'
          }
        ],
        createdAt: '10:19 AM',
        updatedAt: '10:28 AM'
      },
      {
        id: 'REQ-02',
        projectId,
        title: 'Trim 2.5s off the intro pause in Clip #2',
        description: 'Speaker hesitates before the whiteboard explanation. Please cut start time from 18.0s to 20.5s.',
        clipId: 'clip_02',
        status: 'in_progress',
        priority: 'normal',
        author: 'client',
        authorName: 'Alex (Client Lead)',
        comments: [
          {
            id: 'c3',
            requirementId: 'REQ-02',
            author: 'editor',
            authorName: 'Sarah (Video Editor)',
            content: 'Working on adjusting the in-point right now.',
            createdAt: '10:32 AM'
          }
        ],
        createdAt: '10:30 AM',
        updatedAt: '10:32 AM'
      }
    ];

    try {
      localStorage.setItem(`${REQ_STORAGE_PREFIX}${projectId}`, JSON.stringify(initial));
    } catch (e) {}
    return initial;
  },

  createRequirement: (
    projectId: string,
    title: string,
    description: string,
    clipId: string | undefined,
    priority: 'low' | 'normal' | 'urgent',
    author: 'client' | 'editor',
    authorName: string
  ): Requirement => {
    const list = requirementService.getRequirements(projectId);
    const newReq: Requirement = {
      id: `REQ-${String(list.length + 1).padStart(2, '0')}`,
      projectId,
      title,
      description,
      clipId,
      status: 'open',
      priority,
      author,
      authorName,
      comments: [],
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    list.unshift(newReq);
    try {
      localStorage.setItem(`${REQ_STORAGE_PREFIX}${projectId}`, JSON.stringify(list));
    } catch (e) {}

    // Also append an activity log entry
    requirementService.addWorkLog(
      projectId,
      'client',
      `Requirement ${newReq.id} Filed`,
      `"${title}" (${priority.toUpperCase()}) filed by ${authorName}`,
      authorName
    );

    return newReq;
  },

  updateRequirementStatus: (
    projectId: string,
    requirementId: string,
    status: Requirement['status'],
    actorName: string
  ): Requirement[] => {
    const list = requirementService.getRequirements(projectId);
    const item = list.find((r) => r.id === requirementId);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      try {
        localStorage.setItem(`${REQ_STORAGE_PREFIX}${projectId}`, JSON.stringify(list));
      } catch (e) {}

      requirementService.addWorkLog(
        projectId,
        'editor',
        `Requirement ${requirementId} ${status.toUpperCase().replace('_', ' ')}`,
        `Status updated to ${status} by ${actorName}`,
        actorName
      );
    }
    return list;
  },

  addComment: (
    projectId: string,
    requirementId: string,
    content: string,
    author: 'client' | 'editor',
    authorName: string
  ): RequirementComment | null => {
    const list = requirementService.getRequirements(projectId);
    const item = list.find((r) => r.id === requirementId);
    if (!item) return null;

    const comment: RequirementComment = {
      id: `c_${Date.now()}`,
      requirementId,
      author,
      authorName,
      content,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    item.comments.push(comment);
    item.updatedAt = comment.createdAt;
    try {
      localStorage.setItem(`${REQ_STORAGE_PREFIX}${projectId}`, JSON.stringify(list));
    } catch (e) {}
    return comment;
  },

  getWorkLogs: (projectId: string): ProjectWorkLog[] => {
    try {
      const stored = localStorage.getItem(`${LOG_STORAGE_PREFIX}${projectId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error loading logs from storage', e);
    }

    const initial: ProjectWorkLog[] = [
      {
        id: 'log-1',
        projectId,
        category: 'upload',
        title: 'Source Video Ingested',
        details: 'Uploaded lecture.mp4 (45.2 MB, 92.5s duration). Validated container integrity.',
        actor: 'Sarah (Editor)',
        timestamp: '10:14 AM',
        commitHash: '7a1f8c'
      },
      {
        id: 'log-2',
        projectId,
        category: 'ai',
        title: 'Gemini Multimodal Analysis Complete',
        details: 'Analyzed semantics, audio pacing, and slide changes. Extracted 3 high-retention segments (Avg 92% match).',
        actor: 'Gemini 2.5 Flash',
        timestamp: '10:16 AM',
        commitHash: 'ai_9f2b'
      },
      {
        id: 'log-3',
        projectId,
        category: 'ffmpeg',
        title: 'Clip Segments Extracted',
        details: 'Cut 3 clips to /storage/clips/ with H.264 video and AAC audio.',
        actor: 'FFmpeg Engine',
        timestamp: '10:18 AM',
        commitHash: 'ff_3c1d'
      },
      {
        id: 'log-4',
        projectId,
        category: 'editor',
        title: 'Opening Verbal Hook Refined',
        details: 'Rewrote hook on Clip #1 following client guidance to focus on ChatGPT relevance.',
        actor: 'Sarah (Editor)',
        timestamp: '10:28 AM',
        commitHash: 'ed_5b4e'
      }
    ];

    try {
      localStorage.setItem(`${LOG_STORAGE_PREFIX}${projectId}`, JSON.stringify(initial));
    } catch (e) {}
    return initial;
  },

  addWorkLog: (
    projectId: string,
    category: ProjectWorkLog['category'],
    title: string,
    details: string,
    actor: string
  ): ProjectWorkLog => {
    const logs = requirementService.getWorkLogs(projectId);
    const newLog: ProjectWorkLog = {
      id: `log-${Date.now()}`,
      projectId,
      category,
      title,
      details,
      actor,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      commitHash: Math.random().toString(36).substring(2, 8)
    };
    logs.unshift(newLog);
    try {
      localStorage.setItem(`${LOG_STORAGE_PREFIX}${projectId}`, JSON.stringify(logs));
    } catch (e) {}
    return newLog;
  }
};
