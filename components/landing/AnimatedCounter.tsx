"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * AnimatedCounter - Animates a number counting up when scrolled into view.
 * 
 * Features:
 * - Spring physics for natural easing
 * - Supports suffixes (%, +, etc.)
 * - Triggers on scroll into view
 * - Respects prefers-reduced-motion
 */

interface AnimatedCounterProps {
    value: number;
    suffix?: string;
    prefix?: string;
    duration?: number; // in seconds
    className?: string;
    decimals?: number;
}

export function AnimatedCounter({
    value,
    suffix = "",
    prefix = "",
    duration = 1.5,
    className,
    decimals = 0,
}: AnimatedCounterProps) {
    const prefersReducedMotion = useReducedMotion();
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [displayValue, setDisplayValue] = useState(0);

    // Motion value for the count
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        stiffness: 100,
        damping: 30,
        duration: duration * 1000,
    });

    useEffect(() => {
        if (isInView) {
            if (prefersReducedMotion) {
                // Skip animation for reduced motion
                setDisplayValue(value);
            } else {
                // Animate to target value
                motionValue.set(value);
            }
        }
    }, [isInView, value, prefersReducedMotion, motionValue]);

    useEffect(() => {
        if (prefersReducedMotion) return;

        const unsubscribe = springValue.on("change", (latest) => {
            setDisplayValue(parseFloat(latest.toFixed(decimals)));
        });

        return () => unsubscribe();
    }, [springValue, decimals, prefersReducedMotion]);

    // Format the display value
    const formattedValue = decimals > 0
        ? displayValue.toFixed(decimals)
        : Math.round(displayValue).toString();

    return (
        <motion.span
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            {prefix}{formattedValue}{suffix}
        </motion.span>
    );
}
