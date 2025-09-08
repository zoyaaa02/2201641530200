// // logger.ts
// const LOG_API = "http://20.244.56.144/evaluation-service/logs";

// // Allowed values
// export type Stack = "backend" | "frontend";
// export type Level = "debug" | "info" | "warn" | "error" | "fatal";

// // Packages allowed for each stack
// const validPackages = {
//   backend: ["cache", "controller", "cron_job", "dh", "domain", "handler", "repository", "route", "service"],
//   frontend: ["api", "component", "hook", "page", "state", "style"],
//   common: ["auth", "config", "middleware", "utils"]
// } as const;

// type BackendPackage = (typeof validPackages.backend)[number];
// type FrontendPackage = (typeof validPackages.frontend)[number];
// type CommonPackage = (typeof validPackages.common)[number];

// export type Package = BackendPackage | FrontendPackage | CommonPackage;

// // Define the log entry type
// export interface LogEntry {
//   stack: Stack;
//   level: Level;
//   package: Package;
//   message: string;
// }

// /**
//  * Reusable logging function
//  */
// export async function Log(
//   stack: Stack,
//   level: Level,
//   pkg: Package,
//   message: string
// ) {
//   try {
//     // Validation
//     if (!["backend", "frontend"].includes(stack)) {
//       throw new Error(`Invalid stack: ${stack}`);
//     }
//     if (!["debug", "info", "warn", "error", "fatal"].includes(level)) {
//       throw new Error(`Invalid level: ${level}`);
//     }
//     if (
//       !(validPackages[stack] as readonly string[]).includes(pkg) &&
//       !(validPackages.common as readonly string[]).includes(pkg)
//     ) {
//       throw new Error(`Invalid package: ${pkg} for stack: ${stack}`);
//     }

//     const body: LogEntry = { stack, level, package: pkg, message };

//     const response = await fetch(LOG_API, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body)
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to log: ${response.status}`);
//     }

//     const data = await response.json();
//     console.info("Log Created:", data);

//     return data;
//   } catch (err: any) {
//     console.error("Logging failed:", err.message);
//   }
// }


// src/lib/logger.ts
const LOG_API = "http://20.244.56.144/evaluation-service/logs";

export type Stack = "backend" | "frontend";
export type Level = "debug" | "info" | "warn" | "error" | "fatal";

const validPackages = {
  backend: ["cache", "controller", "cron_job", "dh", "domain", "handler", "repository", "route", "service"],
  frontend: ["api", "component", "hook", "page", "state", "style"],
  common: ["auth", "config", "middleware", "utils"]
} as const;

type BackendPackage = (typeof validPackages.backend)[number];
type FrontendPackage = (typeof validPackages.frontend)[number];
type CommonPackage = (typeof validPackages.common)[number];
export type Package = BackendPackage | FrontendPackage | CommonPackage;

export interface LogEntry {
  id: string;
  timestamp: string;
  stack: Stack;
  level: Level;
  package: Package;
  message: string;
}

// Local storage key
const LOG_KEY = "app_logs";

/**
 * Core logging function (sends to API + saves locally)
 */
export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
) {
  const entry: LogEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    stack,
    level,
    package: pkg,
    message
  };

  try {
    // Save locally
    const existing = getLogs();
    existing.push(entry);
    localStorage.setItem(LOG_KEY, JSON.stringify(existing));

    // Send to evaluation server
    const response = await fetch(LOG_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to log: ${response.status}`);
    }

    const data = await response.json();
    console.info("Log Created:", data);

    return data;
  } catch (err: any) {
    console.error("Logging failed:", err.message);
  }
}

/**
 * Get logs from localStorage
 */
export function getLogs(): LogEntry[] {
  const raw = localStorage.getItem(LOG_KEY);
  return raw ? (JSON.parse(raw) as LogEntry[]) : [];
}

export async function logEvent(
  level: Level,
  message: string,
  data?: any
) {
  return Log("frontend", level, "component", `${message} ${data ? JSON.stringify(data) : ""}`);
}

/**
 * Clear logs in localStorage
 */
export function clearLogs() {
  localStorage.removeItem(LOG_KEY);
}
