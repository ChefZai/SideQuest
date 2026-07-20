import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppV2 from "./v2/AppV2";
import "./v2/v2.css";
import "./v2/mobile-shell.css";
import "./v2/warmth.css";
import "./v2/responsive-shell.css";
import "./v2/sunlit.css";
import "./v2/onboarding.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppV2 />
  </StrictMode>,
);
