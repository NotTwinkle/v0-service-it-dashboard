"use client";

import { useRef, ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface HorizontalScrollSectionProps {
    children: ReactNode;
}

export const HorizontalScrollSection = ({ children }: HorizontalScrollSectionProps) => {
    const pinRef = useRef<HTMLDivElement>(null);
    const horizontalRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!pinRef.current || !horizontalRef.current) return;

        const pinElement = pinRef.current;
        const horizontalElement = horizontalRef.current;

        // Get the total width needed for horizontal scroll
        const getScrollWidth = () => {
            return horizontalElement.scrollWidth - window.innerWidth;
        };

        // Set initial state
        gsap.set(horizontalElement, { x: 0 });

        // Get scroll length function (matches working example pattern)
        const getScrollLength = () => {
            return Math.max(0, horizontalElement.scrollWidth - window.innerWidth);
        };

        // Create horizontal scrolling animation with pinning (matches working example)
        const containerTween = gsap.to(horizontalElement, {
            x: () => -getScrollLength(),
            ease: "none",
            scrollTrigger: {
                trigger: pinElement,
                start: "top top",
                end: () => `+=${getScrollLength()}`,
                scrub: 1,
                pin: true,
                anticipatePin: 1,
                pinType: 'transform', // Critical: matches working example
                invalidateOnRefresh: true,
            },
        });

        // Panel fade in/out while scrolling horizontally.
        // This uses ScrollTrigger's "containerAnimation" so triggers are based on horizontal movement.
        const panels = gsap.utils.toArray<HTMLElement>(horizontalElement.children as any);
        panels.forEach((panel, idx) => {
            // Keep the first panel visible when we enter the horizontal section.
            gsap.set(panel, { opacity: idx === 0 ? 1 : 0.15, willChange: "opacity" });

            gsap.timeline({
                scrollTrigger: {
                    trigger: panel,
                    containerAnimation: containerTween,
                    start: "left 85%",
                    end: "right 15%",
                    scrub: true,
                    markers: false, // Set to true for debugging
                },
            })
                // Fade in as panel approaches center
                .to(panel, { opacity: 1, duration: 0.4, ease: "none" }, 0)
                // Fade out as panel exits
                .to(panel, { opacity: 0.15, duration: 0.4, ease: "none" }, 0.6);
        });

        // Refresh on resize
        const handleResize = () => {
            ScrollTrigger.refresh();
        };
        window.addEventListener("resize", handleResize);

        // Cleanup function
        return () => {
            containerTween.kill();
            window.removeEventListener("resize", handleResize);
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.trigger === pinElement || panels.includes(trigger.trigger as HTMLElement)) {
                    trigger.kill();
                }
            });
        };
    }, { scope: pinRef, dependencies: [] });

    return (
        <div ref={pinRef} className="relative w-screen overflow-hidden">
            <div 
                ref={horizontalRef}
                className="flex w-max"
                style={{ willChange: "transform" }}
            >
                {children}
            </div>
        </div>
    );
};
