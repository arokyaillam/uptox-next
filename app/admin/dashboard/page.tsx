'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      // Check for development mode user first
      const devUser = localStorage.getItem('dev_admin_user')
      if (devUser && process.env.NODE_ENV === 'development') {
        setUser(JSON.parse(devUser))
        setLoading(false)
        return
      }

      // Check for real Supabase user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        router.push('/admin/login')
      }
      setLoading(false)
    }

    checkUser()
  }, [router])

  const handleLogout = async () => {
    // Handle development mode logout
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem('dev_admin_user')
      router.push('/admin/login')
      return
    }

    // Handle real Supabase logout
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Feed Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Monitor and manage market data feeds
              </p>
              <Button className="mt-4" onClick={() => router.push('/test-feed')}>
                Test Market Feed
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Manage user accounts and permissions
              </p>
              <Button className="mt-4" variant="outline">
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                View system health and performance
              </p>
              <Button className="mt-4" variant="outline">
                View Status
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Configure application settings
              </p>
              <Button className="mt-4" variant="outline">
                Open Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {user && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}