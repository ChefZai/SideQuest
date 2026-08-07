export function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function questTransitionName(id: string): string {
  return `quest-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

let transitionPending = false;

export function transitionView(update: () => void): void {
  if (prefersReducedMotion() || transitionPending || typeof document.startViewTransition !== "function") {
    update();
    return;
  }
  try {
    transitionPending = true;
    const transition = document.startViewTransition(update);
    // Browsers may abort an in-flight transition when navigation happens quickly.
    // That is a harmless visual fallback, not an application error.
    void transition.ready.catch(() => undefined);
    void transition.updateCallbackDone.catch(() => undefined);
    void transition.finished.catch(() => undefined).finally(() => { transitionPending = false; });
  } catch {
    transitionPending = false;
    update();
  }
}
