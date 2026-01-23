"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { Copy, FileSpreadsheet, AlertCircle, RefreshCw } from "lucide-react";
import { SectionWrapper } from "./SectionWrapper";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef, useState } from "react";

/**
 * Features Section - Performance Optimized
 * 
 * Optimizations:
 * - Removed infinite icon breathing animation
 * - Removed infinite arrow animation 
 * - Use CSS transitions instead of Framer for hover effects
 * - Reduced number of motion components
 * - Pill rotation uses CSS animation instead of Framer infinite
 */

const features = [
    {
        icon: Copy,
        title: "Tool Fragmentation",
        description: "Work spans across Asana, Ivanti, and spreadsheets, creating data silos.",
        color: "text-blue-500",
        bg: "bg-blue-50",
    },
    {
        icon: FileSpreadsheet,
        title: "Manual Reconciliation",
        description: "Hours wasted manually cross-referencing timesheets against tickets.",
        color: "text-green-500",
        bg: "bg-green-50",
    },
    {
        icon: AlertCircle,
        title: "Hidden Variance",
        description: "Budget overruns go unnoticed until it's too late to correct them.",
        color: "text-red-500",
        bg: "bg-red-50",
    },
];

export const Features = () => {
    const prefersReducedMotion = useReducedMotion();
    const pillRef = useRef<HTMLDivElement>(null);
    const [isPillHovered, setIsPillHovered] = useState(false);

    // Magnetic effect for the solution pill - only track when hovered
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { stiffness: 200, damping: 25 };
    const pillX = useSpring(mouseX, springConfig);
    const pillY = useSpring(mouseY, springConfig);

    const handlePillMouseMove = (event: React.MouseEvent) => {
        if (prefersReducedMotion || !pillRef.current) return;
        const rect = pillRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set((event.clientX - centerX) * 0.12);
        mouseY.set((event.clientY - centerY) * 0.12);
    };

    const handlePillMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
        setIsPillHovered(false);
    };

    return (
        <section id="features" className="py-12 sm:py-16 md:py-20 bg-gray-50/50">
            <SectionWrapper>
                {/* Section Header - Simple fade in */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-astronaut mb-3 sm:mb-4">
                        The Cost of <span className="text-orange-500">Disconnected</span> Work.
                    </h2>
                    <p className="text-gray-600 text-base sm:text-lg">
                        Without a unified view, IT teams lose hours to administration and meaningful insights are buried in spreadsheets.
                    </p>
                </motion.div>

                {/* Feature Cards - CSS hover transitions, staggered entrance only */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                                delay: 0.1 + i * 0.1,
                                duration: 0.4
                            }}
                            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
                        >
                            {/* Icon - CSS hover only, no infinite animation */}
                            <div className={`w-12 h-12 ${feature.bg} ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className="size-6" />
                            </div>

                            <h3 className="text-xl font-bold text-astronaut mb-3 group-hover:text-orange-600 transition-colors duration-300">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Arrow indicator - CSS only, no infinite animation */}
                            <div className="mt-4 text-orange-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                                Learn more
                                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* The Solution Bridge */}
                <div className="mt-20 relative">
                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                        <motion.div
                            className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        />
                    </div>

                    <div className="flex justify-center">
                        <motion.div
                            ref={pillRef}
                            onMouseMove={handlePillMouseMove}
                            onMouseEnter={() => setIsPillHovered(true)}
                            onMouseLeave={handlePillMouseLeave}
                            style={{
                                x: prefersReducedMotion ? 0 : pillX,
                                y: prefersReducedMotion ? 0 : pillY,
                            }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-3 bg-astronaut text-white px-6 py-3 rounded-full shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            {/* CSS rotation animation - much more performant */}
                            <RefreshCw
                                className="size-5"
                                style={{
                                    animation: prefersReducedMotion ? 'none' : 'spin 10s linear infinite',
                                }}
                            />
                            <span className="font-medium">Service IT+ Reconciles Everything</span>
                        </motion.div>
                    </div>
                </div>
            </SectionWrapper>

            {/* CSS Animation */}
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </section>
    );
};
