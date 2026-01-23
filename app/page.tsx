import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { VarianceAnalytics } from "@/components/landing/VarianceAnalytics";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { HorizontalScrollSection } from "@/components/landing/HorizontalScrollSection";
import { LandingScrollReveal } from "@/components/landing/LandingScrollReveal";

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-white selection:bg-orange-100 selection:text-orange-900">
            <Navbar />
            <LandingScrollReveal>
                <Hero />
            </LandingScrollReveal>
            <LandingScrollReveal className="bg-transparent">
                <Features />
            </LandingScrollReveal>
            <HorizontalScrollSection>
                <VarianceAnalytics />
                <CTA />
            </HorizontalScrollSection>
            <LandingScrollReveal>
                <Footer />
            </LandingScrollReveal>
        </main>
    );
}
