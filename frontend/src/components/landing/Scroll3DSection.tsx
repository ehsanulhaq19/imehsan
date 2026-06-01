"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
};

/**
 * Scroll-linked 3D tilt for section content (rotateX + scale + translateZ).
 * Opacity is intentionally omitted — scroll-linked opacity on the content wrapper
 * caused hover overlay flicker on nested interactive cards during mid-scroll 3D transforms.
 * Respects prefers-reduced-motion.
 */
export function Scroll3DSection({ children, className = "", innerClassName = "" }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.92", "end 0.08"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.32, 0.55, 1], reduceMotion ? [0, 0, 0, 0] : [13, 4, -1, -11]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    reduceMotion ? [1, 1, 1, 1, 1] : [0.935, 0.98, 1, 1, 0.97],
  );
  const z = useTransform(scrollYProgress, [0, 0.5, 1], reduceMotion ? [0, 0, 0] : [-24, 0, -12]);

  return (
    <section
      ref={ref}
      className={`relative isolate overflow-x-clip [perspective:1100px] [perspective-origin:50%_12%] ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          scale,
          translateZ: z,
          transformOrigin: "50% 8%",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
        }}
        className={`relative [transform-style:preserve-3d] ${innerClassName}`}
      >
        {children}
      </motion.div>
    </section>
  );
}
