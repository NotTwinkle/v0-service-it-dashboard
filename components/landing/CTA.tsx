"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionWrapper } from "./SectionWrapper";
import { MagneticButton } from "./MagneticButton";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * CTA Section - Performance Optimized
 * 
 * Optimizations:
 * - REMOVED requestAnimationFrame gradient loop (major performance killer)
 * - Replaced with static mesh gradient + CSS animations
 * - Removed particle animations
 * - Removed infinite arrow animation
 * - Gradients animate via CSS keyframes instead of JS
 */

export const CTA = () => {
    const prefersReducedMotion = useReducedMotion();

    return (
        <section
            className="py-12 sm:py-16 md:py-24 relative overflow-hidden bg-astronaut flex-shrink-0"
            style={{ width: "100vw" }}
        >
            {/* Static Mesh Gradient Background - CSS animation for subtle movement */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Base gradient layer */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: `
                            radial-gradient(ellipse 80% 70% at 18% 20%, rgba(185, 182, 221, 0.9) 0%, rgba(185, 182, 221, 0.3) 50%, transparent 100%),
                            radial-gradient(ellipse 85% 70% at 78% 18%, rgba(45, 48, 122, 0.95) 0%, rgba(45, 48, 122, 0.4) 50%, transparent 100%),
                            radial-gradient(ellipse 95% 85% at 46% 58%, rgba(241, 106, 33, 0.95) 0%, rgba(241, 106, 33, 0.5) 50%, transparent 100%),
                            radial-gradient(ellipse 95% 90% at 80% 78%, rgba(247, 144, 33, 0.9) 0%, rgba(247, 144, 33, 0.4) 50%, transparent 100%)
                        `,
                        filter: 'blur(80px)',
                    }}
                />

                {/* Animated overlay for subtle movement - CSS only */}
                {!prefersReducedMotion && (
                    <div
                        className="absolute inset-0 animate-gradient-shift"
                        style={{
                            background: `
                                radial-gradient(ellipse 60% 50% at 25% 30%, rgba(241, 106, 33, 0.3) 0%, transparent 70%),
                                radial-gradient(ellipse 60% 50% at 75% 70%, rgba(185, 182, 221, 0.25) 0%, transparent 70%)
                            `,
                            filter: 'blur(60px)',
                        }}
                    />
                )}
            </div>

            <SectionWrapper className="relative z-10 text-center">
                <motion.div
                    className="max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
                        Ready to Unify Your IT Workflow?
                    </h2>

                    <p className="text-blue-100 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 leading-relaxed">
                        Join enterprise teams who have regained control over their project timelines and data accuracy with Service IT+.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
                        <MagneticButton
                            className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-full bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg shadow-orange-500/25 font-medium flex items-center justify-center gap-2 transition-colors"
                            magneticStrength={0.25}
                            scaleOnHover={1.02}
                        >
                            Start Your Free Trial
                            {/* Static arrow - removed infinite animation */}
                            <ArrowRight className="size-4 sm:size-5" />
                        </MagneticButton>
                        <MagneticButton
                            className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-full border-2 border-blue-400/30 text-white hover:bg-white/10 bg-transparent font-medium flex items-center justify-center transition-colors"
                            magneticStrength={0.2}
                            scaleOnHover={1.02}
                        >
                            Schedule Demo
                        </MagneticButton>
                    </div>
                </motion.div>
            </SectionWrapper>

            {/* Subtle CSS animation for gradient movement */}
            <style jsx>{`
                @keyframes gradient-shift {
                    0%, 100% { 
                        transform: translate(0, 0) scale(1); 
                    }
                    50% { 
                        transform: translate(5%, 3%) scale(1.05); 
                    }
                }
                .animate-gradient-shift {
                    animation: gradient-shift 20s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
};
