"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Shared GSAP setup.
 *
 * `useGSAP` is registered as a plugin so every animation created inside it is
 * collected into a context and reverted automatically on unmount — no manual
 * `kill()` bookkeeping, and no tweens left running against detached nodes.
 */
gsap.registerPlugin(useGSAP);

/** Only animate when the user has not asked for reduced motion. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export const EASE = {
  out: "power3.out",
  inOut: "power2.inOut",
} as const;

export const DURATION = {
  fast: 0.35,
  base: 0.6,
  slow: 0.9,
} as const;

export { gsap, useGSAP };
