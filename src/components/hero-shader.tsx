"use client";

import UnicornScene from "unicornstudio-react/next";

/**
 * Interactive Unicorn Studio scene.
 * Fills the hero plate; responds to pointer movement via the embedded WebGL scene.
 */
export function HeroShader({
  projectId = "cQxFVG8rpPpLPKhTeDPl",
}: {
  projectId?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "transparent",
      }}
    >
      {/* Inner wrapper is taller than the plate so the scene's bottom-center
          "Made with unicorn.studio" badge falls below the clipping edge. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "122%",
        }}
      >
        <UnicornScene
          projectId={projectId}
          width="100%"
          height="100%"
          scale={1}
          dpi={1.5}
          sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.9/dist/unicornStudio.umd.js"
        />
      </div>
    </div>
  );
}
