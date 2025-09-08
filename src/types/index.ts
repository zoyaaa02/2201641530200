export interface LogEntry {
  stack: "backend" | "frontend";
  level: "debug" | "info" | "warn" | "error" | "fatal";
  package: string;
  message: string;
  timestamp?: string;
}

// export interface ShortURL {
//   original: string;
//   shortCode: string;
//   expiry: string;
//   createdAt: string;
//   clicks: number;
// }


export interface ShortURL {
  longUrl: string;       // 🔹 instead of original
  shortcode: string;     // 🔹 instead of shortCode (case fixed)
  createdAt: string;
  expiresAt: string;     // ISO date
  clicks: {
    timestamp: string;
    referrer: string | null;
    geo: { lat?: number; lon?: number; accuracy?: number } | null;
  }[];
}

