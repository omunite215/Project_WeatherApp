"use client";

import { useRef } from "react";

import { EASE, MOTION_OK, gsap, useGSAP } from "@/lib/motion";

/**
 * Counts the temperature up to its value, and tweens between values when the user
 * changes city or unit system.
 *
 * The tween writes to `textContent` rather than React state so it does not trigger
 * a render on every frame.
 */
export function TemperatureCounter({
  value,
  className,
}: {
  /** Already converted to the active unit system. */
  value: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(0);

  useGSAP(
    () => {
      const node = ref.current;
      if (!node) return;

      const mm = gsap.matchMedia();
      const counter = { current: previous.current };

      mm.add(MOTION_OK, () => {
        gsap.to(counter, {
          current: value,
          duration: 1.1,
          ease: EASE.out,
          onUpdate: () => {
            node.textContent = String(Math.round(counter.current));
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        node.textContent = String(Math.round(value));
      });

      previous.current = value;
      return () => mm.revert();
    },
    { dependencies: [value] },
  );

  return (
    <span ref={ref} className={className}>
      {/* Server-rendered value; the tween takes over on the client. */}
      {Math.round(value)}
    </span>
  );
}
