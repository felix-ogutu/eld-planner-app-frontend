// src/lib/api.ts
export const API_BASE =
    import.meta.env.DEV
        ? ''  // Development: use Vite proxy
        : 'https://eld-planner-app-backend-anvfbheco-felixs-projects-4b67393f.vercel.app';  // Production

// Helper to build full URLs
export const apiUrl = (path: string) => `${API_BASE}${path}`;