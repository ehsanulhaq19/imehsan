"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
};

/**
 * Scroll-linked 3D tilt for section content (rotateX + scale + opacity).
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
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.08, 0.12, 0.85, 1],
    reduceMotion ? [1, 1, 1, 1, 1] : [0.55, 0.88, 1, 1, 0.8],
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
          opacity,
          translateZ: z,
          transformOrigin: "50% 8%",
          transformStyle: "preserve-3d",
        }}
        className={`relative will-change-transform ${innerClassName}`}
      >
        {children}
      </motion.div>
    </section>
  );
}
