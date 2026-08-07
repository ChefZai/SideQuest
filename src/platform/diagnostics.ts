export type DiagnosticFeature = "auth" | "spaces" | "quests" | "uploads" | "planner" | "memories" | "inspiration" | "app-shell";
export type DiagnosticCategory = "permission" | "network" | "validation" | "timeout" | "not-found" | "unknown";

export interface DiagnosticContext {
  feature: DiagnosticFeature;
  operation: string;
  category: DiagnosticCategory;
  recoverable: boolean;
  code?: string;
}

export function classifyDiagnostic(feature: DiagnosticFeature, operation: string, error: unknown): DiagnosticContext {
  const code = typeof error === "object" && error && "code" in error ? String(error.code).toLowerCase() : "";
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const category: DiagnosticCategory = code.includes("permission") || code.includes("unauthorized") ? "permission"
    : code.includes("network") || code.includes("unavailable") || message.includes("offline") ? "network"
    : code.includes("not-found") ? "not-found"
    : message.includes("timed out") ? "timeout"
    : code.includes("invalid") || message.includes("valid") ? "validation" : "unknown";
  return { feature, operation, category, recoverable: category !== "validation", ...(code ? { code } : {}) };
}

export function reportDiagnostic(context: DiagnosticContext): void {
  if (!import.meta.env.DEV) return;
  console.warn("[SideQuest diagnostic]", context);
}
