"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, Layers, Clock, TrendingUp } from "lucide-react";
import { MagneticButton } from "./MagneticButton";
import { AnimatedCounter } from "./AnimatedCounter";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Hero Section - Performance Optimized
 * 
 * Optimizations applied:
 * - Removed infinite animations (breathing, pulsing) - major performance killer
 * - Data flow line only animates one element per row (removed extra glow layer)
 * - Hover effects use CSS transitions where possible
 * - Reduced spring stiffness for smoother animations with less computation
 * - Only animate transform/opacity (GPU accelerated)
 */

export const Hero = () => {
    const prefersReducedMotion = useReducedMotion();
    const router = useRouter();
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [isHoveringDashboard, setIsHoveringDashboard] = useState(false);

    // Mouse position for cursor-aware tilt effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Reduced spring stiffness for smoother performance
    const springConfig = { stiffness: 100, damping: 25 };
    const rotateX = useSpring(useTransform(mouseY, [-300, 300], [3, -3]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-3, 3]), springConfig);

    // Handle mouse move over dashboard area (throttled by motion values)
    const handleMouseMove = (event: React.MouseEvent) => {
        if (prefersReducedMotion || !dashboardRef.current) return;

        const rect = dashboardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        mouseX.set(event.clientX - centerX);
        mouseY.set(event.clientY - centerY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
        setIsHoveringDashboard(false);
    };

    // Stats data with numeric values for animation
    const stats = [
        { label: "Tools Unified", value: 3, suffix: "+" },
        { label: "Time Saved", value: 20, suffix: "%" },
        { label: "Data Accuracy", value: 100, suffix: "%" },
    ];

    // Integration items for the dashboard mockup
    const integrations = [
        { name: "Asana Project A", icon: Layers, color: "text-red-500", bg: "bg-red-50" },
        { name: "Ivanti Ticket #123", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
        { name: "Sheet Tracker", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
    ];

    return (
        <section className="relative pt-24 sm:pt-32 pb-8 overflow-hidden bg-white">
            {/* Background Shapes - Static, no animation needed */}
            <div className="absolute top-0 right-0 w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] bg-lavender opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[300px] sm:w-[450px] md:w-[600px] h-[300px] sm:h-[450px] md:h-[600px] bg-orange-100 opacity-20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

            {/* Rhombus Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.15] pointer-events-none"
                style={{
                    backgroundImage: "linear-gradient(135deg, #2d307a 1px, transparent 1px), linear-gradient(45deg, #2d307a 1px, transparent 1px)",
                    backgroundSize: "40px 40px"
                }} />

            <div className="max-w-7xl mx-auto w-full px-4 md:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
                    {/* Text Content - Single entrance animation, no infinite animations */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="order-1 lg:order-1"
                    >
                        {/* Badge - Simple entrance, CSS pulse instead of Framer */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-orange-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                            </span>
                            v2.0 Now Live
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
                            <span className="text-orange-500">Unified Task &</span> <br className="hidden sm:block" />
                            <span className="text-astronaut">Time Intelligence.</span>
                        </h1>

                        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-xl">
                            Stop juggling Asana, Ivanti, and Sheets. Consolidate your enterprise workflow into a single source of truth with advanced time reconciliation and variance analytics.
                        </p>

                        {/* CTA Buttons with magnetic effect */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
                            <MagneticButton
                                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-full h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all font-medium flex items-center justify-center gap-2"
                                magneticStrength={0.2}
                                onClick={() => router.push("/dashboard")}
                            >
                                Dashboard <ArrowRight className="h-4 w-4" />
                            </MagneticButton>
                            <MagneticButton
                                className="w-full sm:w-auto border-2 border-orange-500 text-orange-500 hover:bg-orange-50 hover:border-orange-600 hover:text-orange-600 active:bg-orange-100 rounded-full h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base transition-all font-medium flex items-center justify-center bg-white"
                                magneticStrength={0.15}
                                as="a"
                                href="https://serviceitplus.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Inquire / View Demo
                            </MagneticButton>
                        </div>

                        {/* Animated Stats Counter Section */}
                        <div className="grid grid-cols-3 gap-4 sm:gap-6 border-t border-gray-100 pt-6 sm:pt-8">
                            {stats.map((stat, i) => (
                                <div key={i}>
                                    <AnimatedCounter
                                        value={stat.value}
                                        suffix={stat.suffix}
                                        className="text-xl sm:text-2xl font-bold text-astronaut block"
                                        duration={1.2}
                                    />
                                    <div className="text-xs sm:text-sm text-gray-500">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Hero Visual - Cursor-Aware Dashboard Mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="relative order-2 lg:order-2"
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setIsHoveringDashboard(true)}
                        onMouseLeave={handleMouseLeave}
                        style={{ perspective: 1000 }}
                    >
                        <motion.div
                            ref={dashboardRef}
                            className="relative z-10 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 p-4 sm:p-6 md:p-8"
                            style={{
                                rotateX: prefersReducedMotion ? 0 : rotateX,
                                rotateY: prefersReducedMotion ? 0 : rotateY,
                            }}
                        >
                            {/* Header of the Dashboard Mockup - CSS hover transitions */}
                            <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-3 w-3 rounded-full bg-red-400 hover:scale-125 transition-transform" />
                                    <div className="h-3 w-3 rounded-full bg-yellow-400 hover:scale-125 transition-transform" />
                                    <div className="h-3 w-3 rounded-full bg-green-400 hover:scale-125 transition-transform" />
                                </div>
                                <div className="h-2 w-24 bg-gray-100 rounded-full" />
                            </div>

                            {/* Integration Flows */}
                            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                                <div className="flex justify-between items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-500 mb-2">
                                    <span className="truncate">Sources</span>
                                    <span className="truncate">Reconciliation</span>
                                    <span className="truncate">Unified View</span>
                                </div>

                                {integrations.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 + (i * 0.1), duration: 0.4 }}
                                        className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-gray-50 bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                            <div className={`p-1.5 sm:p-2 rounded-md ${item.bg} ${item.color} shrink-0 group-hover:scale-110 transition-transform`}>
                                                <item.icon className="size-3 sm:size-4" />
                                            </div>
                                            <span className="font-medium text-gray-700 text-xs sm:text-sm truncate">{item.name}</span>
                                        </div>

                                        {/* Animated Connecting Line - Only animate when dashboard is visible/hovered */}
                                        <div className="hidden sm:flex flex-1 h-[2px] bg-gray-100 mx-2 sm:mx-4 relative overflow-hidden shrink-0 rounded-full">
                                            {isHoveringDashboard && !prefersReducedMotion && (
                                                <motion.div
                                                    className="absolute top-0 bottom-0 left-0 w-10 bg-gradient-to-r from-transparent via-orange-400 to-transparent"
                                                    animate={{ left: ["-20%", "120%"] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.4 }}
                                                />
                                            )}
                                        </div>

                                        <CheckCircle2 className="size-3 sm:size-4 text-orange-500 shrink-0 ml-2 group-hover:scale-110 transition-transform" />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Bottom Stats Mockup - CSS hover transitions */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-colors">
                                    <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Variance</div>
                                    <div className="text-sm sm:text-lg font-bold text-astronaut flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                        <span>-4.2 hrs</span>
                                        {/* Static badge - removed infinite opacity animation */}
                                        <span className="text-[10px] sm:text-xs font-normal text-red-500 bg-red-100 px-1.5 py-0.5 rounded">
                                            High Monitor
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors hover:shadow-lg hover:shadow-orange-500/20">
                                    <div className="text-[10px] sm:text-xs text-white/70 mb-1">Time Logged</div>
                                    <div className="text-sm sm:text-lg font-bold">128.5 hrs</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Element - CSS animation instead of Framer infinite */}
                        <div
                            className="absolute -right-10 sm:-right-20 top-0 bg-white p-3 sm:p-4 rounded-lg shadow-xl border border-gray-100 hidden xl:block z-20 hover:scale-105 transition-transform animate-float"
                            style={{
                                animation: prefersReducedMotion ? 'none' : 'float 6s ease-in-out infinite',
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-orange-100 flex items-center justify-center">
                                    <TrendingUp className="size-5 text-orange-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Efficiency</div>
                                    <div className="text-sm font-bold text-astronaut">+15% vs Last Week</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* CSS Animation for floating element - Much more performant than JS */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
            `}</style>
        </section>
    );
};
