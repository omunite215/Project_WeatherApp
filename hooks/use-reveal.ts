"use client";

import { useRef } from "react";

import { DURATION, EASE, MOTION_OK, gsap, useGSAP } from "@/lib/motion";

/**
 * Staggered fade-and-rise for a group of elements.
 *
 * Every animated section shares this hook rather than repeating GSAP boilerplate,
 * so timing stays consistent and the reduced-motion guard cannot be forgotten in
 * one place and remembered in another.
 *
 * Elements are selected by the `data-reveal` attribute within the returned scope.
 */
export function useReveal(dependencies: unknown[] = []) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (targets.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.from(targets, {
          y: 16,
          autoAlpha: 0,
          duration: DURATION.base,
          ease: EASE.out,
          stagger: 0.07,
        });
      });

      // Reduced motion: no tween, just make sure nothing is left invisible.
      mm.add(`(prefers-reduced-motion: reduce)`, () => {
        gsap.set(targets, { autoAlpha: 1, y: 0 });
      });

      return () => mm.revert();
    },
    { scope, dependencies, revertOnUpdate: true },
  );

  return scope;
}
