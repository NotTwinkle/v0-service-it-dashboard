"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Clock, Users, Zap, CheckCircle2 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/serviceitlogo.png" alt="Service IT+" className="w-8 h-8" />
            <span className="font-bold text-xl text-gray-900">Service IT+</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
                Login
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-2 mb-8">
              <span className="text-orange-600 font-medium text-sm">New: Advanced Time Reconciliation</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Unified Task & Time Management
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Consolidate tasks from Asana, Ivanti ITSM, and Google Sheets. Track time, manage workload, and ensure team
              accountability with advanced reconciliation analytics.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <Link href="/dashboard">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg">
                  Explore Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Enterprise Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Real-time Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Multi-platform Support</span>
              </div>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-navy-50 to-orange-50 p-8 md:p-12">
            <div className="absolute inset-0 bg-white opacity-40"></div>
            <div className="relative flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-12 h-12 text-orange-600" />
                </div>
                <p className="text-gray-600 font-medium">Dashboard Analytics</p>
                <p className="text-gray-500 text-sm">Real-time metrics & insights</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Enterprise Features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage tasks and time across platforms</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="premium-card p-8">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Tracking</h3>
              <p className="text-gray-600">
                Log time directly against tasks and track daily 8-hour compliance automatically.
              </p>
            </div>
            <div className="premium-card p-8">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unified View</h3>
              <p className="text-gray-600">
                See all team tasks across Asana, Ivanti, and Innovation in one consolidated view.
              </p>
            </div>
            <div className="premium-card p-8">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Analytics</h3>
              <p className="text-gray-600">
                Visualize workload distribution and time estimates vs actuals across all platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Supported Platforms</h2>
            <p className="text-xl text-gray-600">Integrate with your favorite tools</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Asana", color: "orange" },
              { name: "Ivanti", color: "blue" },
              { name: "Time Tracker", color: "gray" },
              { name: "Innovation", color: "emerald" },
            ].map((platform) => (
              <div key={platform.name} className="premium-card p-8 text-center">
                <div
                  className={`w-14 h-14 rounded-lg bg-${platform.color}-100 flex items-center justify-center mx-auto mb-4`}
                >
                  <span className="text-2xl font-bold text-gray-700">{platform.name[0]}</span>
                </div>
                <p className="font-semibold text-gray-900">{platform.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-navy-600 to-navy-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to optimize your workflow?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Start exploring the dashboard or create an account to unlock personalized insights.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/dashboard">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg">Explore Dashboard</Button>
            </Link>
            <Link href="/auth/login">
              <Button className="bg-white text-navy-600 hover:bg-gray-100 rounded-lg">Create Account</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <p className="text-gray-600">© 2025 Service IT+. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900 transition">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Terms
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
