"use client";

import { createContext, type RefObject } from "react";

/** Scroll container root for intersection-based section reveals on the landing page. */
export const LandingScrollRootContext = createContext<RefObject<HTMLElement | null> | null>(null);
