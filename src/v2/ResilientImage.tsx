import { useState, type ImgHTMLAttributes } from "react";

export function ResilientImage({ className = "", onLoad, onError, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  if (state === "failed") return null;
  return <img {...props} className={`${className} resilient-image is-${state}`.trim()} decoding={props.decoding || "async"} onLoad={event => { setState("ready"); onLoad?.(event); }} onError={event => { setState("failed"); onError?.(event); }} />;
}
