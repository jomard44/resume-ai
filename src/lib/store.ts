// Simple in-memory store for MVP.
// In production, replace with Supabase/Postgres.
// Data is lost on server restart — fine for development and initial launch.

export interface PendingJob {
  jobDescription: string;
  resume: string;
  paid: boolean;
  tailoredResume?: string;
  createdAt: number;
}

export const pendingJobs = new Map<string, PendingJob>();

// Clean up old entries every 30 minutes (prevents memory leaks)
setInterval(
  () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [key, value] of pendingJobs) {
      if (value.createdAt < oneHourAgo) {
        pendingJobs.delete(key);
      }
    }
  },
  30 * 60 * 1000
);
