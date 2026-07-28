"use client";

import { useEffect, useRef } from "react";

// A slow cursor-parallax across the lattice/glow layers — skipped entirely
// under prefers-reduced-motion, and inert until JS loads (layers default to
// their resting transform via CSS).
function useParallax(rootRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function handlePointerMove(event: PointerEvent) {
      const { innerWidth, innerHeight } = window;
      const px = (event.clientX / innerWidth - 0.5) * 2;
      const py = (event.clientY / innerHeight - 0.5) * 2;
      root!.style.setProperty("--px", px.toFixed(3));
      root!.style.setProperty("--py", py.toFixed(3));
    }

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [rootRef]);
}

export function IslamicScene({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useParallax(rootRef);

  return (
    <div
      ref={rootRef}
      className="relative flex flex-1 items-center justify-center overflow-hidden px-0 py-12 sm:px-4 sm:py-16"
      style={{ "--px": 0, "--py": 0 } as React.CSSProperties}
    >
      {/* Dusk backdrop stays dark edge-to-edge — a warm gold glow is layered
          on top near the Arabic word, but nothing transitions to the light
          cream background, so primary-foreground text stays legible
          everywhere in the scene. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 50% 30%, oklch(0.75 0.13 80 / 28%) 0%, transparent 70%), radial-gradient(140% 100% at 50% 100%, oklch(0.32 0.05 155) 0%, oklch(0.15 0.03 155) 100%)",
        }}
      />

      {/* Two lattice depth layers, same motif as the FalahMark logo, drifting
          opposite directions and parallaxing with the cursor. */}
      <div
        aria-hidden="true"
        className="bg-geo-lattice animate-lattice-drift motion-reduce:animate-none pointer-events-none absolute -inset-24 text-primary opacity-[0.16]"
        style={{
          transform:
            "translate3d(calc(var(--px) * 8px), calc(var(--py) * 8px), 0)",
        }}
      />
      <div
        aria-hidden="true"
        className="bg-geo-pattern animate-lattice-drift-reverse motion-reduce:animate-none pointer-events-none absolute -inset-24 text-gold opacity-[0.14]"
        style={{
          transform:
            "translate3d(calc(var(--px) * -14px), calc(var(--py) * -14px), 0)",
        }}
      />

      {/* Crescent, drifting gently in the upper corner. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="animate-crescent-float motion-reduce:animate-none pointer-events-none absolute top-[12%] right-[14%] size-10 text-gold opacity-70 sm:size-14"
        style={{
          transform: "translate3d(calc(var(--px) * 18px), calc(var(--py) * 12px), 0)",
        }}
      >
        <path
          fill="currentColor"
          d="M14.5 3.5a9 9 0 1 0 0 17 7.2 7.2 0 0 1 0-17Z"
        />
      </svg>

      <div className="animate-scene-rise relative flex w-full flex-col items-center gap-8">
        {/* The signature: Falah's own name, glowing above the sign-in card. */}
        <div className="relative flex flex-col items-center gap-1.5">
          <div
            aria-hidden="true"
            className="animate-lantern-pulse motion-reduce:animate-none absolute inset-0 -z-10 scale-150 rounded-full bg-gold/30 blur-2xl"
          />
          <p className="font-arabic text-5xl font-medium text-gold sm:text-6xl">
            الفلاح
          </p>
          <p className="text-xs tracking-[0.3em] text-primary-foreground/70 uppercase">
            Falah &middot; Success
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
