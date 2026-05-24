import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const DESIGN_WIDTH = 1080;
const DESIGN_HEIGHT = 1920;

function applyAppScale() {
  const scale = Math.min(
    window.innerWidth / DESIGN_WIDTH,
    window.innerHeight / DESIGN_HEIGHT
  );
  document.documentElement.style.setProperty("--app-scale", String(scale));
}

applyAppScale();
window.addEventListener("resize", applyAppScale);
window.addEventListener("orientationchange", applyAppScale);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
