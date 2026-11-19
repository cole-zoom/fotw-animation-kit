import { Config } from "@remotion/cli/config";

// The show is 1920×1080 @ 60 fps (set per composition in src/Root.tsx).
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// CSS 3D (boldKit) and three.js scenes both need a real GPU path in headless Chrome.
Config.setChromiumOpenGlRenderer("angle");
