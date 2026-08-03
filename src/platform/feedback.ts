export type FeedbackIntent = "selection" | "save" | "milestone" | "memory" | "reaction";

export interface HapticAdapter {
  impact(intent: FeedbackIntent): void | Promise<void>;
}

let hapticAdapter: HapticAdapter | null = null;

export function registerHapticAdapter(adapter: HapticAdapter | null): void {
  hapticAdapter = adapter;
}

export function signalFeedback(intent: FeedbackIntent): void {
  try {
    const result = hapticAdapter?.impact(intent);
    if (result instanceof Promise) void result.catch(() => undefined);
  } catch {
    // Feedback must never interrupt the action it acknowledges.
  }
}
