"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
          <Link href="/user/dashboard">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Monthly Compliance */}
        <Card className="bg-white border-gray-200 mb-8">
          <CardHeader>
            <CardTitle>Monthly Time Compliance</CardTitle>
            <CardDescription>Estimated vs Actual hours logged per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="estimated" fill="#1B3A6B" radius={[4, 4, 0, 0]} name="Estimated (160h)" />
                <Bar dataKey="actual" fill="#FF6B35" radius={[4, 4, 0, 0]} name="Actual Logged" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Client Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Hours by Client</CardTitle>
              <CardDescription>Time allocation across clients (Current Month)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientBreakdown.map((client) => (
                  <div key={client.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{client.name}</span>
                      <span className="text-sm text-gray-600">
                        {client.hours}h ({client.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${client.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
              <CardDescription>Performance overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 mb-1">Average Daily Logged</p>
                <p className="text-3xl font-bold text-green-700">7.9h</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 mb-1">Accuracy Rate</p>
                <p className="text-3xl font-bold text-blue-700">98%</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-600 mb-1">On-Time Completion</p>
                <p className="text-3xl font-bold text-orange-700">85%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
