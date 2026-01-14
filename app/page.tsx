  "use client"

  import Link from "next/link"
  import { usePathname } from "next/navigation"
  import { Button } from "@/components/ui/button"
  import { ArrowRight, BarChart3, Clock, Users, Zap, CheckCircle2 } from "lucide-react"

  export default function LandingPage() {
    const pathname = usePathname()

    const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // If already on home page, smooth scroll to top instead of navigating
      if (pathname === "/") {
        e.preventDefault()
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        })
      }
    }

    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-600 via-orange-600 to-orange-700 border-b border-orange-500/50 shadow-lg shadow-orange-900/10 backdrop-blur-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between text-white">
            <Link href="/" onClick={handleLogoClick} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-200 group-hover:scale-105">
                <img src="/SERVICEITLOGO.png" alt="Service IT+" className="w-8 h-8 object-contain" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold tracking-tight">Service IT+</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <a
                href="#features"
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                Features
              </a>
              <a
                href="#platforms"
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                Platforms
              </a>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                Dashboard
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/auth/signup">
                <Button
                  variant="ghost"
                  className="hidden sm:flex h-9 px-4 text-white hover:bg-white/10 border-0 font-medium"
                >
                  Sign Up
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  className="h-9 px-6 bg-white text-orange-600 border-0 rounded-full shadow-md shadow-orange-900/20 hover:-translate-y-0.5 hover:scale-105 hover:bg-orange-50 hover:shadow-lg hover:shadow-orange-900/30 active:scale-100 transition-all duration-200 ease-out font-semibold tracking-wide focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-600"
                >
                  Login
                </Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section id="dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200/80 rounded-full px-4 py-1.5 mb-5 shadow-sm">
              <span className="inline-flex h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-xs font-semibold tracking-[0.2em] text-orange-700 uppercase">
                New · Advanced Time Reconciliation
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-gray-900">
              <span className="block text-[var(--chart-2)]">Unified Task &amp;</span>
              <span className="block bg-gradient-to-r from-orange-500 via-orange-600 to-navy-700 bg-clip-text text-transparent">
                Time Management
              </span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
              Consolidate work from Asana, Ivanti ITSM, and Google Sheets into a single source of truth. Track time,
              balance workloads, and close the loop with reconciliation insights your team can trust.
            </p>
            <div className="flex flex-wrap gap-3 mb-7">
              <Link href="/demo">
                <Button
                  size="lg"
                  className="rounded-full bg-orange-600 hover:bg-orange-700 text-white px-7 shadow-lg shadow-orange-900/25 hover:-translate-y-0.5 hover:shadow-orange-900/40 transition-all"
                >
                  View Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-gray-300 bg-white/70 text-gray-800 hover:bg-gray-50"
                >
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-xs md:text-sm text-gray-600">
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Enterprise ready controls</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Real-time time &amp; task analytics</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Multi-platform integrations</span>
              </div>
            </div>
            </div>
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-navy-900 p-8 md:p-12 shadow-2xl">
            <div className="relative h-96 flex items-center justify-center">
              <div className="w-full max-w-md mx-auto rounded-2xl border border-white/30 bg-white/90 backdrop-blur-md shadow-xl p-6 space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                      Live Overview
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">Service IT+ Dashboard</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                      Today
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">7.9h</p>
                    <p className="text-[11px] text-emerald-600">+0.4h vs target</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                      Compliance
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">96%</p>
                    <p className="text-[11px] text-emerald-600">On track</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                      Open tasks
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">24</p>
                    <p className="text-[11px] text-amber-600">6 at risk</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-800 text-slate-50 px-4 py-3 border border-white/10 shadow-[0_18px_40px_rgba(15,23,42,0.55)]">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-orange-300 ring-1 ring-orange-400/40">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">
                        Reconciliation alert
                      </p>
                      <span className="inline-flex items-center rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-medium text-orange-200 border border-orange-400/30">
                        3 users
                      </span>
                    </div>
                    <p className="text-[13px] leading-snug font-medium">
                      Ivanti shows more logged time than Time Tracker for 3 engineers.
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="relative h-1.5 flex-1 rounded-full bg-slate-700 overflow-hidden">
                        <div className="absolute inset-y-0 left-0 w-2/3 rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-300" />
                      </div>
                      <span className="text-[10px] text-slate-300 whitespace-nowrap">
                        67% reviewed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 bg-gradient-to-b from-white via-gray-50 to-white border-y border-gray-100">
        <div className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-24 max-w-5xl rounded-full bg-gradient-to-r from-orange-400/15 via-orange-500/10 to-navy-700/15 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
              Platform Highlights
            </span>
            <h2 className="mt-6 text-4xl font-bold text-gray-900">Enterprise Features</h2>
            <p className="mt-3 text-lg text-gray-600">
              Everything you need to manage tasks and time across Service IT+ workflows.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-white/80 p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-transparent to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Tracking</h3>
                <p className="text-sm text-gray-600">
                  Log time directly against tasks, auto-calculate daily compliance, and surface gaps before they become
                  issues.
                </p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white/80 p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-navy-50/80 via-transparent to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unified View</h3>
                <p className="text-sm text-gray-600">
                  Pull work from Asana, Ivanti, and internal trackers into a single, prioritized view for your team.
                </p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white/80 p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-transparent to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Analytics</h3>
                <p className="text-sm text-gray-600">
                  Compare estimates vs. actuals, spot overloads, and understand how time is distributed across platforms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Platforms Section */}
        <section id="platforms" className="relative py-20 bg-white">
          <div className="pointer-events-none absolute inset-x-0 -top-16 mx-auto h-28 max-w-5xl rounded-full bg-gradient-to-r from-orange-400/15 via-orange-500/10 to-navy-700/12 blur-3xl" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Supported Platforms</h2>
              <p className="text-lg text-gray-600">Integrate with your favorite tools</p>
            </div>
            <div className="grid gap-6 md:grid-cols-4 sm:grid-cols-2">
              {[
                {
                  name: "Asana",
                  caption: "Projects & tasks in Asana",
                  border: "#f06a6a",
                  glow: "linear-gradient(135deg, rgba(240,106,106,0.18), rgba(255,226,214,0.2))",
                  badge: (
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "#ffe9df" }}
                    >
                      <div className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#f06a6a" }} />
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#f6a15d" }} />
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#f8c07a" }} />
                      </div>
                    </div>
                  ),
                },
                {
                  name: "Ivanti",
                  caption: "ITSM & ticketing in Ivanti",
                  border: "#e63b2f",
                  glow: "linear-gradient(135deg, rgba(230,59,47,0.18), rgba(255,208,203,0.18))",
                  badge: (
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "#ffe1dc" }}
                    >
                      <span className="text-base font-black uppercase tracking-tight" style={{ color: "#e63b2f" }}>
                        iv
                      </span>
                    </div>
                  ),
                },
                {
                  name: "Time Tracker",
                  caption: "Native time logging & approvals",
                  border: "#0ea5e9",
                  glow: "linear-gradient(135deg, rgba(14,165,233,0.16), rgba(217,246,255,0.22))",
                  badge: (
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700"
                      aria-hidden
                    >
                      <Clock className="h-6 w-6" />
                    </div>
                  ),
                },
                {
                  name: "Innovation",
                  caption: "Ideas, experiments, and pilots",
                  border: "#10b981",
                  glow: "linear-gradient(135deg, rgba(16,185,129,0.16), rgba(222,255,239,0.2))",
                  badge: (
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"
                      aria-hidden
                    >
                      <Zap className="h-6 w-6" />
                    </div>
                  ),
                },
              ].map((platform) => (
                <div
                  key={platform.name}
                  className="group relative overflow-hidden rounded-2xl border bg-white/85 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                  style={{ borderColor: platform.border }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ background: platform.glow }}
                  />
                  <div className="relative">
                    {platform.badge}
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">{platform.name}</h3>
                    <p className="mt-2 text-sm text-gray-600">{platform.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 text-white py-20">
          <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.9),_transparent_55%)]"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="uppercase tracking-[0.4em] text-xs text-orange-100 mb-4">Service IT+</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Ready to optimize your workflow?</h2>
            <p className="text-orange-50 mb-10 text-lg md:text-xl max-w-3xl mx-auto">
              Consolidate your team's productivity data and unlock actionable insights with one unified dashboard.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/dashboard">
                <Button className="bg-white text-orange-700 hover:bg-orange-50 rounded-xl px-8 py-6 text-lg shadow-lg shadow-orange-900/30">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute -right-10 top-10 w-52 h-52 rounded-full border border-white/30 opacity-60"></div>
          <div className="absolute -left-16 bottom-0 w-64 h-64 rounded-full border border-white/20 opacity-40"></div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shadow-sm ring-1 ring-orange-100 overflow-hidden">
                  <img
                    src="/SERVICEITLOGO.png"
                    alt="Service IT+"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold tracking-wide text-gray-900">
                    Service IT+
                  </p>
                  <p className="text-xs text-gray-500">
                    © 2025 Service IT+. All rights reserved.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600">
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Privacy
                </a>
                <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-gray-300" />
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Terms
                </a>
                <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-gray-300" />
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
}
