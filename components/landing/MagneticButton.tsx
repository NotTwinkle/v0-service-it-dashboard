"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * MagneticButton - A button that subtly pulls toward the cursor on hover.
 * Creates a premium, interactive feel inspired by award-winning sites.
 * 
 * Features:
 * - Magnetic pull effect (button follows cursor within bounds)
 * - Scale feedback on hover
 * - Press/active state feedback
 * - Respects prefers-reduced-motion
 */

interface MagneticButtonProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    magneticStrength?: number; // 0-1, default 0.3
    scaleOnHover?: number; // default 1.02
    as?: "button" | "a";
    href?: string;
    disabled?: boolean;
}

export function MagneticButton({
    children,
    className,
    onClick,
    magneticStrength = 0.3,
    scaleOnHover = 1.02,
    as = "button",
    href,
    disabled = false,
}: MagneticButtonProps) {
    const prefersReducedMotion = useReducedMotion();
    const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

    // Motion values for magnetic effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Spring physics for smooth, natural movement
    const springConfig = { stiffness: 400, damping: 30 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    // Handle mouse move for magnetic effect
    const handleMouseMove = (event: React.MouseEvent) => {
        if (prefersReducedMotion || disabled || !ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate distance from center
        const deltaX = event.clientX - centerX;
        const deltaY = event.clientY - centerY;

        // Apply magnetic pull (limited by strength)
        x.set(deltaX * magneticStrength);
        y.set(deltaY * magneticStrength);
    };

    const handleMouseLeave = () => {
        // Reset position
        x.set(0);
        y.set(0);
    };

    // Animation variants
    const variants = {
        initial: { scale: 1 },
        hover: prefersReducedMotion ? {} : { scale: scaleOnHover },
        tap: prefersReducedMotion ? {} : { scale: 0.98 },
    };

    const Component = motion[as] as typeof motion.button;

    return (
        <Component
            ref={ref as any}
            href={as === "a" ? href : undefined}
            onClick={onClick}
            disabled={disabled}
            className={cn("relative overflow-hidden", className)}
            style={{
                x: prefersReducedMotion ? 0 : springX,
                y: prefersReducedMotion ? 0 : springY,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            variants={variants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            {/* Ripple/glow effect on hover */}
            <motion.span
                className="absolute inset-0 bg-white/10 rounded-full pointer-events-none"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={prefersReducedMotion ? {} : { scale: 2, opacity: 0.15 }}
                transition={{ duration: 0.4 }}
            />
            {children}
        </Component>
    );
}
