import { Component, type ErrorInfo, type ReactNode } from "react";
import { classifyDiagnostic, reportDiagnostic } from "./diagnostics";

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    reportDiagnostic(classifyDiagnostic("app-shell", "render", error));
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="auth"><section className="panel" role="alert"><p className="eyebrow">Your story is safe</p><h1>SideQuest needs a fresh start.</h1><p>Something interrupted this screen. Try it again—your saved Quests and Memories are still here.</p><div className="first-run-actions"><button className="primary" onClick={() => this.setState({ failed: false })}>Try again</button><button className="secondary" onClick={() => location.reload()}>Reload SideQuest</button></div></section></main>;
  }
}
