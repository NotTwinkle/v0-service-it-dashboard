"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MagneticButton } from "./MagneticButton";

/**
 * Navbar - Enhanced with premium interactions
 * 
 * Enhancements:
 * - Animated underline on nav link hover
 * - Magnetic effect on CTA button
 * - Logo hover effect
 * - Smooth GSAP scroll behavior (existing)
 */

// Animated nav link with underline effect
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const prefersReducedMotion = useReducedMotion();

    return (
        <Link href={href} className="relative group py-1">
            <span className="relative z-10 transition-colors duration-200 group-hover:text-orange-500">
                {children}
            </span>
            {!prefersReducedMotion && (
                <motion.span
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                />
            )}
        </Link>
    );
};

export const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navRef = useRef<HTMLElement | null>(null);
    const prefersReducedMotion = useReducedMotion();

    // Register ScrollTrigger once in browser
    if (typeof window !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
    }

    // Navbar behavior: visible at top, hide on scroll down, show on scroll up, show on hover
    useGSAP(() => {
        if (!navRef.current || prefersReducedMotion) return;

        const navEl = navRef.current;

        // State tracking
        let isHovering = false;
        let scrollY = 0;
        let hideTimeout: NodeJS.Timeout | null = null;

        // Ensure navbar starts visible and positioned correctly
        gsap.set(navEl, { y: 0 });

        // Force initial visibility
        navEl.style.transform = "translateY(0px)";
        navEl.style.opacity = "1";

        const showNavbar = () => {
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
            gsap.to(navEl, {
                y: 0,
                duration: 0.3,
                ease: "power2.out",
                overwrite: true,
            });
        };

        const hideNavbar = () => {
            // Don't hide if hovering or at top
            if (isHovering || scrollY < 100) return;

            gsap.to(navEl, {
                y: -100,
                duration: 0.3,
                ease: "power2.out",
                overwrite: true,
            });
        };

        // Hover behavior
        const handleMouseEnter = () => {
            isHovering = true;
            showNavbar();
        };

        const handleMouseLeave = () => {
            isHovering = false;
            // Small delay before checking if we should hide
            hideTimeout = setTimeout(() => {
                if (!isHovering && scrollY > 100) {
                    // Check current scroll direction
                    const currentScroll = ScrollTrigger.getAll().find(t => t.vars.start === 0)?.scroll();
                    if (currentScroll && currentScroll > scrollY) {
                        hideNavbar();
                    }
                }
            }, 150);
        };

        // Use ScrollTrigger to track scroll
        const trigger = ScrollTrigger.create({
            start: 0,
            end: "max",
            onUpdate: (self) => {
                scrollY = self.scroll();

                // Always show at top
                if (scrollY < 100) {
                    showNavbar();
                    return;
                }

                // If hovering, always show
                if (isHovering) {
                    showNavbar();
                    return;
                }

                // Hide on scroll down, show on scroll up
                if (self.direction === 1) {
                    // Scrolling down
                    hideNavbar();
                } else if (self.direction === -1) {
                    // Scrolling up
                    showNavbar();
                }
            },
        });

        // Add hover listeners
        navEl.addEventListener("mouseenter", handleMouseEnter);
        navEl.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            if (hideTimeout) clearTimeout(hideTimeout);
            trigger.kill();
            navEl.removeEventListener("mouseenter", handleMouseEnter);
            navEl.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [prefersReducedMotion]);

    return (
        <nav
            ref={navRef as any}
            className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                {/* Logo with hover effect */}
                <Link href="/" className="flex items-center gap-2 group">
                    <motion.div
                        whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                        <Image
                            src="/Service IT Logo Remake.avif"
                            alt="Service IT+"
                            width={120}
                            height={32}
                            className="h-6 sm:h-8 w-auto transition-opacity group-hover:opacity-90"
                            priority
                        />
                    </motion.div>
                </Link>

                {/* Desktop Nav Links with animated underlines */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                    <NavLink href="#features">Features</NavLink>
                    <NavLink href="#variance">Variance</NavLink>
                    <NavLink href="#integration">Integrations</NavLink>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Login link with hover effect */}
                    <Link
                        href="/auth/login"
                        className="text-sm font-medium text-astronaut hover:text-orange-500 transition-colors hidden md:block relative group"
                    >
                        <span>Log In</span>
                        {!prefersReducedMotion && (
                            <motion.span
                                className="absolute -bottom-0.5 left-0 right-0 h-[1.5px] bg-orange-500 origin-left"
                                initial={{ scaleX: 0 }}
                                whileHover={{ scaleX: 1 }}
                                transition={{ duration: 0.2 }}
                            />
                        )}
                    </Link>

                    {/* Magnetic CTA Button */}
                    <MagneticButton
                        className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition-colors text-white rounded-full px-4 sm:px-6 py-2 text-xs sm:text-sm shadow-md hover:shadow-lg font-medium"
                        magneticStrength={0.2}
                        scaleOnHover={1.02}
                    >
                        <span className="hidden sm:inline">Get Started</span>
                        <span className="sm:hidden">Start</span>
                    </MagneticButton>

                    {/* Mobile menu toggle */}
                    <motion.button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:text-orange-500 transition-colors"
                        aria-label="Toggle menu"
                        whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                    >
                        <AnimatePresence mode="wait">
                            {mobileMenuOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <X className="h-6 w-6" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Menu className="h-6 w-6" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>

            {/* Mobile Menu with enhanced animations */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <motion.div
                            className="max-w-7xl mx-auto px-4 py-4 space-y-1"
                            initial="closed"
                            animate="open"
                            variants={{
                                open: {
                                    transition: { staggerChildren: 0.07, delayChildren: 0.1 }
                                },
                                closed: {
                                    transition: { staggerChildren: 0.05, staggerDirection: -1 }
                                }
                            }}
                        >
                            {[
                                { href: "#features", label: "Features" },
                                { href: "#variance", label: "Variance" },
                                { href: "#integration", label: "Integrations" },
                                { href: "/auth/login", label: "Log In" },
                            ].map((link, i) => (
                                <motion.div
                                    key={link.href}
                                    variants={{
                                        open: { opacity: 1, x: 0 },
                                        closed: { opacity: 0, x: -20 }
                                    }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block text-sm font-medium text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors py-3 px-3 rounded-lg"
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
