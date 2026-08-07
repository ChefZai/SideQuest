export function latestOperation() {
  let generation = 0;
  return {
    begin: () => ++generation,
    isLatest: (value: number) => value === generation,
    cancel: () => { generation += 1; },
  };
}

export function pendingGuard() {
  let pending = false;
  return {
    enter() { if (pending) return false; pending = true; return true; },
    leave() { pending = false; },
    get active() { return pending; },
  };
}
