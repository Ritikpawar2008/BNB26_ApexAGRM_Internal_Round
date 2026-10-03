export const ROUTES = {
  HOME: '/',
  UPLOAD: '/projects/new',
  ANALYSIS: (id: string) => `/projects/${id}/analysis`,
  STUDIO: (id: string) => `/projects/${id}/studio`,
  EXPORT: (id: string) => `/projects/${id}/export`,
} as const;
