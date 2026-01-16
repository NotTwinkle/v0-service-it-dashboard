"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ArrowLeft, BarChart3 } from "lucide-react"

const monthlyData = [
  { month: "Jan", estimated: 160, actual: 150, target: 160 },
  { month: "Feb", estimated: 160, actual: 155, target: 160 },
  { month: "Mar", estimated: 160, actual: 162, target: 160 },
  { month: "Apr", estimated: 160, actual: 158, target: 160 },
]

const clientBreakdown = [
  { name: "Client A", hours: 45, percentage: 35 },
  { name: "Client B", hours: 38, percentage: 30 },
  { name: "Client C", hours: 32, percentage: 25 },
  { name: "Internal", hours: 10, percentage: 10 },
]

export default function ReportsPage() {
  const router = useRouter()

  useEffect(() => {
    const session = localStorage.getItem("userSession")
    if (!session) {
      router.push("/auth/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#f16a21] via-[#f16a21] to-[#f79021] border-b border-orange-500/50 shadow-lg shadow-orange-900/10 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md ring-2 ring-white/20">
                <BarChart3 className="w-6 h-6 text-[#f16a21]" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Reports & Analytics</h1>
                <p className="text-[10px] text-orange-100 font-medium">Performance insights</p>
              </div>
            </div>
          </div>
          <Link href="/dashboard">
            <Button className="h-9 px-6 bg-white text-[#f16a21] border-0 rounded-full shadow-md shadow-orange-900/20 hover:-translate-y-0.5 hover:scale-105 hover:bg-orange-50 hover:shadow-lg hover:shadow-orange-900/30 active:scale-100 transition-all duration-200 ease-out font-semibold tracking-wide">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Monthly Compliance */}
        <Card className="bg-white border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Monthly Time Compliance</CardTitle>
            <CardDescription className="text-gray-600">Estimated vs Actual hours logged per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="estimated" fill="#2d307a" radius={[4, 4, 0, 0]} name="Estimated (160h)" />
                <Bar dataKey="actual" fill="#f16a21" radius={[4, 4, 0, 0]} name="Actual Logged" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Client Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Hours by Client</CardTitle>
              <CardDescription className="text-gray-600">Time allocation across clients (Current Month)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {clientBreakdown.map((client) => (
                  <div key={client.name} className="group">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="font-semibold text-gray-900 group-hover:text-[#f16a21] transition-colors">{client.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                          {client.hours}h
                        </span>
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                          {client.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#f16a21] via-[#f79021] to-[#f79021] h-2.5 rounded-full transition-all duration-500 ease-out group-hover:from-[#f79021] group-hover:via-[#f16a21] group-hover:to-[#f16a21]"
                        style={{ width: `${client.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Key Metrics</CardTitle>
              <CardDescription className="text-gray-600">Performance overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-shadow group">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600 mb-2">Average Daily Logged</p>
                <p className="text-4xl font-extrabold text-green-700 group-hover:scale-105 transition-transform">7.9h</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow group">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 mb-2">Accuracy Rate</p>
                <p className="text-4xl font-extrabold text-blue-700 group-hover:scale-105 transition-transform">98%</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 hover:shadow-md transition-shadow group">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f16a21] mb-2">On-Time Completion</p>
                <p className="text-4xl font-extrabold text-orange-700 group-hover:scale-105 transition-transform">85%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
