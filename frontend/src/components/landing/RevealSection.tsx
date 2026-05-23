"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { LandingScrollRootContext } from "@/contexts/LandingScrollRootContext";

type RevealSectionProps = {
  children: React.ReactNode;
  className?: string;
  priority?: boolean;
};

/** Denser thresholds near the low range for gradual opacity ramps while scrolling. */
const THRESHOLDS = [
  0, 0.025, 0.05, 0.065, 0.08, 0.092, 0.105, 0.118, 0.13, 0.155, 0.2, 0.28, 0.4, 0.55, 0.72, 0.88, 1,
];

/** Cross slightly earlier/later feels smoother paired with softer easing. */
const VISIBLE_RATIO = 0.1;

export function RevealSection({ children, className = "", priority = false }: RevealSectionProps) {
  const landingScrollRoot = useContext(LandingScrollRootContext);
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(priority);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setShown(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const root = landingScrollRoot?.current ?? null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        setShown(e.intersectionRatio >= VISIBLE_RATIO);
      },
      {
        root,
        rootMargin: "4% 0px 4% 0px",
        threshold: THRESHOLDS,
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [landingScrollRoot]);

  return (
    <div
      ref={ref}
      className={`ease-brand-reveal will-change-[opacity,transform] transform-gpu transition-[opacity,transform] duration-[1150ms] motion-reduce:transition-none motion-reduce:duration-0 ${
        shown ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
