"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Scrubbed fade in/out wrapper for vertical sections.
// Use this for non-pinned/non-horizontal sections so the animation "reacts" to scroll.
export function LandingScrollReveal({
  children,
  className = "bg-white",
}: {
  children: ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  useGSAP(() => {
    if (!rootRef.current) return;

    const el = rootRef.current;

    // Start slightly faded so it "reacts" both directions.
    gsap.set(el, { autoAlpha: 0.15, y: 16, willChange: "opacity, transform" });

    const tween = gsap.to(el, {
      autoAlpha: 1,
      y: 0,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        end: "top 35%",
        scrub: true,
        markers: false,
      },
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}

