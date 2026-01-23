"use client";

import { motion, useInView } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { SectionWrapper } from "./SectionWrapper";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef, useState, useEffect } from "react";

/**
 * VarianceAnalytics Section - Performance Optimized
 * 
 * Optimizations:
 * - Removed infinite legend dot pulse animations
 * - Removed infinite bullet point scale animations
 * - Simplified motion components
 * - CSS transitions for hover effects
 */

const data = [
    { name: 'Wk 1', estimated: 40, actual: 42 },
    { name: 'Wk 2', estimated: 38, actual: 35 },
    { name: 'Wk 3', estimated: 45, actual: 50 },
    { name: 'Wk 4', estimated: 40, actual: 38 },
    { name: 'Wk 5', estimated: 42, actual: 48 },
    { name: 'Wk 6', estimated: 40, actual: 40 },
];

const listItems = [
    "Automated alerts for >10% variance",
    "Drill down by project, team, or individual",
    "Historical trend analysis for better forecasting"
];

export const VarianceAnalytics = () => {
    const prefersReducedMotion = useReducedMotion();
    const chartRef = useRef<HTMLDivElement>(null);
    const isChartInView = useInView(chartRef, { once: true, margin: "-100px" });
    const [showChart, setShowChart] = useState(false);

    // Delay chart render until in view for animation effect
    useEffect(() => {
        if (isChartInView) {
            const timer = setTimeout(() => setShowChart(true), 200);
            return () => clearTimeout(timer);
        }
    }, [isChartInView]);

    return (
        <section
            id="variance"
            className="pt-8 sm:pt-12 pb-16 sm:pb-20 md:pb-24 bg-white overflow-hidden flex-shrink-0"
            style={{ width: "100vw" }}
        >
            <SectionWrapper>
                <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
                    {/* Text Content */}
                    <motion.div
                        className="order-2 lg:order-1"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="text-orange-500 font-medium mb-2 tracking-wide uppercase text-xs sm:text-sm">
                            Real-time Intelligence
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-astronaut mb-4 sm:mb-6">
                            Spot Variance Before It <br className="hidden sm:block" /> Becomes a Budget Issue.
                        </h2>
                        <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
                            Our advanced analytics engine compares estimated effort against actual logs from Asana and Ivanti in real-time.
                        </p>

                        {/* List Items - Staggered entrance, no infinite animations */}
                        <ul className="space-y-4">
                            {listItems.map((item, i) => (
                                <motion.li
                                    key={i}
                                    className="flex items-center gap-3 group"
                                    initial={{ opacity: 0, x: -15 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                                >
                                    {/* Static bullet - removed infinite scale animation */}
                                    <div className="size-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <div className="size-2 rounded-full bg-green-500" />
                                    </div>
                                    <span className="text-gray-700 font-medium group-hover:text-astronaut transition-colors duration-200">
                                        {item}
                                    </span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Chart Card */}
                    <motion.div
                        ref={chartRef}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="relative bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl order-1 lg:order-2 hover:shadow-3xl transition-shadow duration-300"
                    >
                        {/* Chart Header - Simplified, no nested motion */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-astronaut">Project Velocity</h3>
                                <p className="text-sm text-gray-500">Estimated vs Actual Hours</p>
                            </div>
                            <div className="flex gap-4 text-sm">
                                {/* Static legend dots - removed infinite pulse */}
                                <div className="flex items-center gap-2 hover:scale-105 transition-transform">
                                    <div className="size-3 rounded-full bg-orange-500" />
                                    <span className="text-gray-600">Actual</span>
                                </div>
                                <div className="flex items-center gap-2 hover:scale-105 transition-transform">
                                    <div className="size-3 rounded-full bg-astronaut" />
                                    <span className="text-gray-600">Estimated</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart with fade-in animation */}
                        <motion.div
                            className="h-[250px] sm:h-[300px] md:h-[350px] w-full"
                            initial={{ opacity: 0 }}
                            animate={showChart ? { opacity: 1 } : {}}
                            transition={{ duration: 0.6 }}
                        >
                            {showChart && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data}>
                                        <defs>
                                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f16a21" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f16a21" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorEst" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2d307a" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#2d307a" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                                padding: '12px 16px'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="estimated"
                                            stroke="#2d307a"
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#colorEst)"
                                            animationDuration={prefersReducedMotion ? 0 : 1200}
                                            animationEasing="ease-out"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="actual"
                                            stroke="#f16a21"
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#colorActual)"
                                            animationDuration={prefersReducedMotion ? 0 : 1200}
                                            animationBegin={prefersReducedMotion ? 0 : 200}
                                            animationEasing="ease-out"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </SectionWrapper>
        </section>
    );
};
