"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { SectionWrapper } from "./SectionWrapper";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Footer Section - Enhanced with premium interactions
 * 
 * Enhancements:
 * - Staggered column reveals on scroll
 * - Animated underline link hover effects
 * - Logo hover effect
 * - Social icons with hover scale
 */

// Animation variants for staggered columns
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        }
    }
};

const columnVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 25,
        }
    }
};

// Animated link component with underline effect
const AnimatedLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const prefersReducedMotion = useReducedMotion();
    const isExternal = href.startsWith("http");

    if (isExternal) {
        return (
            <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative group inline-block"
            >
                <span className="relative z-10 transition-colors duration-200 group-hover:text-orange-500">
                    {children}
                </span>
                {!prefersReducedMotion && (
                    <motion.span
                        className="absolute bottom-0 left-0 h-[1px] bg-orange-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </a>
        );
    }

    return (
        <Link href={href} className="relative group inline-block">
            <span className="relative z-10 transition-colors duration-200 group-hover:text-orange-500">
                {children}
            </span>
            {!prefersReducedMotion && (
                <motion.span
                    className="absolute bottom-0 left-0 h-[1px] bg-orange-500"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.2 }}
                />
            )}
        </Link>
    );
};

export const Footer = () => {
    const prefersReducedMotion = useReducedMotion();

    const footerLinks = {
        platform: [
            { label: "ITSM", href: "https://www.serviceitplus.com/it-service-management" },
            { label: "ITAM", href: "https://www.serviceitplus.com/itam" },
            { label: "Security Services", href: "https://www.serviceitplus.com/security-services" },
            { label: "Education and Training", href: "https://www.serviceitplus.com/education-and-training-services" },
        ],
        company: [
            { label: "About Us", href: "https://www.serviceitplus.com/about" },
            { label: "Contact Us", href: "https://www.serviceitplus.com/contact" },
            { label: "Resources", href: "https://www.serviceitplus.com/resources" },
            { label: "Careers", href: "https://www.serviceitplus.com/careers" },
        ],
        legal: [
            { label: "Privacy Policy", href: "https://www.serviceitplus.com/privacy-policy" },
            { label: "Terms and Conditions", href: "https://www.serviceitplus.com/terms-and-conditions" },
            { label: "Company Profile", href: "https://www.serviceitplus.com/_files/ugd/c2b3db_cc0c41bf0ff244ed89306f5903362ebb.pdf" },
        ],
    };

    return (
        <footer className="bg-white border-t border-gray-100 py-12">
            <SectionWrapper>
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12"
                    variants={prefersReducedMotion ? undefined : containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {/* Brand Column */}
                    <motion.div
                        className="col-span-1 sm:col-span-2 md:col-span-1"
                        variants={prefersReducedMotion ? undefined : columnVariants}
                    >
                        <Link href="/" className="flex items-center gap-2 mb-4 group">
                            <motion.div
                                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                <Image
                                    src="/Service IT Logo Remake.avif"
                                    alt="Service IT+"
                                    width={120}
                                    height={32}
                                    className="h-6 sm:h-8 w-auto transition-opacity group-hover:opacity-80"
                                />
                            </motion.div>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                            The unified task and time intelligence platform for modern enterprise IT teams.
                        </p>
                    </motion.div>

                    {/* Platform Column */}
                    <motion.div variants={prefersReducedMotion ? undefined : columnVariants}>
                        <h4 className="font-bold text-astronaut mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            {footerLinks.platform.map((link, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + i * 0.05 }}
                                >
                                    <AnimatedLink href={link.href}>{link.label}</AnimatedLink>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Company Column */}
                    <motion.div variants={prefersReducedMotion ? undefined : columnVariants}>
                        <h4 className="font-bold text-astronaut mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            {footerLinks.company.map((link, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.25 + i * 0.05 }}
                                >
                                    <AnimatedLink href={link.href}>{link.label}</AnimatedLink>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Legal Column */}
                    <motion.div variants={prefersReducedMotion ? undefined : columnVariants}>
                        <h4 className="font-bold text-astronaut mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            {footerLinks.legal.map((link, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + i * 0.05 }}
                                >
                                    <AnimatedLink href={link.href}>{link.label}</AnimatedLink>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </motion.div>

                {/* Bottom Bar */}
                <motion.div
                    className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                >
                    <p>© {new Date().getFullYear()} Service IT+. All rights reserved.</p>

                    {/* Social Icons with hover effects */}
                    <div className="flex gap-4">
                        {[
                            { name: "Facebook", url: "https://www.facebook.com/ServiceITplus" },
                            { name: "X", url: "https://twitter.com/ServiceITInc" },
                            { name: "LinkedIn", url: "https://www.linkedin.com/company/serviceit-plus/posts/?feedView=all" },
                            { name: "YouTube", url: "https://www.youtube.com/@ServiceIT_plus" },
                        ].map((social) => (
                            <motion.a
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-orange-500 transition-colors text-xs"
                                whileHover={prefersReducedMotion ? {} : { scale: 1.1, y: -2 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                {social.name}
                            </motion.a>
                        ))}
                    </div>
                </motion.div>
            </SectionWrapper>
        </footer>
    );
};
