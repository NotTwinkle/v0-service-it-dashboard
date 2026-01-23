"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect user's motion preference for accessibility.
 * Returns true if user prefers reduced motion.
 * 
 * Usage:
 * const prefersReducedMotion = useReducedMotion();
 * const animationProps = prefersReducedMotion ? {} : { animate: { scale: 1.1 } };
 */
export function useReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        // Check if window is available (client-side)
        if (typeof window === "undefined") return;

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

        // Set initial value
        setPrefersReducedMotion(mediaQuery.matches);

        // Listen for changes
        const handleChange = (event: MediaQueryListEvent) => {
            setPrefersReducedMotion(event.matches);
        };

        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    return prefersReducedMotion;
}
