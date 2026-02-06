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

        // Use gsap.matchMedia for responsive behavior
        const mm = gsap.matchMedia();

        // Desktop: Horizontal scroll animation
        mm.add("(min-width: 1024px)", () => {
            // Reset any transforms from mobile
            gsap.set(horizontalElement, { x: 0, clearProps: "all" });

            // Get scroll length function
            const getScrollLength = () => {
                return Math.max(0, horizontalElement.scrollWidth - window.innerWidth);
            };

            // Create horizontal scrolling animation with pinning
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
                    pinType: 'transform',
                    invalidateOnRefresh: true,
                },
            });

            // Panel fade in/out while scrolling horizontally
            const panels = gsap.utils.toArray<HTMLElement>(horizontalElement.children as any);
            panels.forEach((panel, idx) => {
                gsap.set(panel, { opacity: idx === 0 ? 1 : 0.15, willChange: "opacity" });

                gsap.timeline({
                    scrollTrigger: {
                        trigger: panel,
                        containerAnimation: containerTween,
                        start: "left 85%",
                        end: "right 15%",
                        scrub: true,
                    },
                })
                    .to(panel, { opacity: 1, duration: 0.4, ease: "none" }, 0)
                    .to(panel, { opacity: 0.15, duration: 0.4, ease: "none" }, 0.6);
            });

            // Cleanup function for desktop
            return () => {
                containerTween.kill();
                ScrollTrigger.getAll().forEach(trigger => {
                    if (trigger.trigger === pinElement || panels.includes(trigger.trigger as HTMLElement)) {
                        trigger.kill();
                    }
                });
            };
        });

        // Mobile: No horizontal scroll, just normal vertical flow
        mm.add("(max-width: 1023px)", () => {
            // Reset any transforms and ensure normal flow
            gsap.set(horizontalElement, { x: 0, clearProps: "all" });
            
            // Kill any existing ScrollTriggers on mobile
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.trigger === pinElement) {
                    trigger.kill();
                }
            });
        });

        // Cleanup matchMedia on unmount
        return () => {
            mm.revert();
        };
    }, { scope: pinRef });

    return (
        <div 
            ref={pinRef} 
            className="relative w-full lg:w-screen lg:overflow-hidden"
        >
            <div 
                ref={horizontalRef}
                className="flex flex-col lg:flex-row lg:w-max w-full"
            >
                {children}
            </div>
        </div>
    );
};
