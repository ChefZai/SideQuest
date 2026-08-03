export function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function questTransitionName(id: string): string {
  return `quest-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export function transitionView(update: () => void): void {
  if (prefersReducedMotion() || typeof document.startViewTransition !== "function") {
    update();
    return;
  }
  document.startViewTransition(update);
}
