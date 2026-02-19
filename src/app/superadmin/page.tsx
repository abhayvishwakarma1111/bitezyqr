'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SuperAdmin() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/check-superadmin')
        if (res.ok) {
          setAuthorized(true)
        } else {
          // This triggers the login screen to show
          setAuthorized(false)
        }
      } catch (err) {
        setAuthorized(false)
      }
    }

    checkAuth()
  }, [])

  const handleSuperAdminLogin = async () => {
    const res = await fetch('/api/superadmin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    if (res.ok) {
      setAuthorized(true)
      setError('')
    } else {
      setError('Incorrect password')
    }
  }



  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [newRestaurant, setNewRestaurant] = useState({ 
    name: '',
    address: '',
    logo_url: '',
    qr_code: '',
    dashboard_username: '',
    admin_password: '',
    chef_password: '',
    line1: '',
    line2: '',
    line3: '',
    line4: '',
    line5: '',
     tax_enabled: false,
    tax_type: '',
    tax_percentage: 0,

    packaging_enabled: false,
    packaging_charge: 0
  })

  const fetchRestaurants = async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setRestaurants(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (authorized) {
      fetchRestaurants()
    }
  }, [authorized])

  const generateSlug = (name: string) => { 
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') 
      .replace(/[^\w-]+/g, '')
  }

  const addRestaurant = async () => {
    if (!newRestaurant.name) {
      alert('Restaurant name required')
      return
    }

    const slug = generateSlug(newRestaurant.name)

    const response = await fetch('/api/create-restaurant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newRestaurant,
        slug 
      })  
    })

    if (!response.ok) {
      alert('Error creating restaurant')
      return
    }

    setNewRestaurant({
      name: '',
      address: '',
      logo_url: '',
      qr_code: '',
      dashboard_username: '',
      admin_password: '',
      chef_password: '',
      line1: '',
      line2: '',
      line3: '',
      line4: '',
      line5: '',
      tax_enabled: false,
      tax_type: '',
      tax_percentage: 0,
      packaging_enabled: false,
      packaging_charge: 0
    })

    fetchRestaurants()
  }

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking session...</p>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff7f2]">
        <div className="bg-white p-10 rounded-3xl shadow-lg w-96 text-center">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">
            Super Admin Access
          </h1>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-3 w-full mb-4 rounded-xl text-gray-900"
          />

          {error && (
            <p className="text-red-500 text-sm mb-3">{error}</p>
          )}

          <button
            onClick={handleSuperAdminLogin}
            className="w-full bg-[#ff5a1f] text-white py-3 rounded-xl"
          >
            Enter
          </button>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-[#fff7f2] p-10">

      <h1 className="text-4xl font-bold text-[#ff5a1f] mb-10">
        Super Admin Dashboard
      </h1>

      {/* Add Restaurant */}
      <div className="bg-white p-8 rounded-3xl shadow-md mb-12 border border-orange-100">

        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Add New Restaurant
        </h2>

        <div className="space-y-5">

          <input
            type="text"
            placeholder="Restaurant Name"
            value={newRestaurant.name}
            onChange={e =>
              setNewRestaurant({
                ...newRestaurant,
                name: e.target.value
              })
            }
            className="border border-gray-300 p-3 rounded-xl w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
          />

          <input
            type="text"
            placeholder="Address"
            value={newRestaurant.address}
            onChange={e =>
              setNewRestaurant({
                ...newRestaurant,
                address: e.target.value
              })
            }
            className="border border-gray-300 p-3 rounded-xl w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
          />

          <input
            type="text"
            placeholder="Logo URL (optional)"
            value={newRestaurant.logo_url}
            onChange={e =>
              setNewRestaurant({
                ...newRestaurant,
                logo_url: e.target.value
              })
            }
            className="border border-gray-300 p-3 rounded-xl w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
          />

          <input
            type="text"
            placeholder="QR Code Image URL (optional)"
            value={newRestaurant.qr_code}
            onChange={e =>
              setNewRestaurant({
                ...newRestaurant,
                qr_code: e.target.value
              })
            }
            className="border border-gray-300 p-3 rounded-xl w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
          />

          <input 
            type="text"
            placeholder="Dashboard Username"
            value={newRestaurant.dashboard_username}
            onChange={(e) =>
              setNewRestaurant({
                ...newRestaurant,
                dashboard_username: e.target.value 
              })
            }
            className="border border-gray-300 p-3 rounded-xl w-full bg-white text-gray-900"
          /> 

          <input
            type="password"
            placeholder="Admin Password"
            value={newRestaurant.admin_password}
            onChange={(e) =>
              setNewRestaurant({
                ...newRestaurant,
                admin_password: e.target.value
              })
            }
            className="border border-gray-300 p-3 rounded-xl w-full bg-white text-gray-900"
          />

          <input
            type="password"
            placeholder="Chef Password"
            value={newRestaurant.chef_password}
            onChange={(e) =>
              setNewRestaurant({
                ...newRestaurant,
                chef_password: e.target.value 
              })
            }
            className="border border-gray-300 p-3 rounded-xl w-full bg-white text-gray-900"
          />

          <input
            type="text"
            placeholder="line1 (optional)"
            value={newRestaurant.line1}
            onChange={e =>
              setNewRestaurant({
                ...newRestaurant,
                line1: e.target.value
              })
            }
            className="border border-gray-300 p-3 rounded-xl w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
          />

          <input
            type="text"
            placeholder="line2 (optional)"
            value={newRestaurant.line2}
            onChange={e =>
              setNewRestaurant({
                ...newRestaurant,
                line2: e.target.value
              })
            }
            className="border border-gray-300 p-3 rounded-xl w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
          />

          <input
            type="text"
            placeholder="line3 (optional)"
            value={newRestaurant.line3}
            onChange={e =>
              setNewRestaurant({
                ...newRestaurant,
                line3: e.target.value
              })
            }
            className="border border-gray-300 p-3 rounded-xl w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
          />

          <input
            type="text"
            placeholder="line4 (optional)"
            value={newRestaurant.line4}
            onChange={e =>
              setNewRestaurant({
                ...newRestaurant,
                line4: e.target.value
              })
            }
            className="border border-gray-300 p-3 rounded-xl w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
          />

          <input
            type="text"
            placeholder="line5 (optional)"
            value={newRestaurant.line5}
            onChange={e =>
              setNewRestaurant({
                ...newRestaurant,
                line5: e.target.value
              })
            }
            className="border border-gray-300 p-3 rounded-xl w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
          />

          <hr className="my-6" />

          <h3 className="text-lg font-semibold text-gray-900">
            Tax Settings
          </h3>

          <label className="flex items-center gap-3 mt-3 text-gray-900">
            <input
              type="checkbox"
              checked={newRestaurant.tax_enabled}
              onChange={(e) =>
                setNewRestaurant({
                  ...newRestaurant,
                  tax_enabled: e.target.checked
                })
              }
            />
            Enable Tax
          </label>

          {newRestaurant.tax_enabled && (
            <>
              <select
                value={newRestaurant.tax_type}
                onChange={(e) =>
                  setNewRestaurant({
                    ...newRestaurant,
                    tax_type: e.target.value
                  })
                }
                className="border border-gray-300 p-3 rounded-xl w-full mt-3 text-gray-900"
              >
                <option value="">Select Tax Type</option>
                <option value="exclusive">Exclusive</option>
                <option value="inclusive">Inclusive</option>
              </select>

              <input
                type="number"
                placeholder="Tax Percentage (e.g. 5)"
                value={newRestaurant.tax_percentage}
                onChange={(e) =>
                  setNewRestaurant({
                    ...newRestaurant,
                    tax_percentage: Number(e.target.value)
                  })
                }
                className="border border-gray-300 p-3 rounded-xl w-full mt-3 text-gray-900"
              />
            </>
          )}

          <hr className="my-6" />

          <h3 className="text-lg font-semibold text-gray-900">
            Packaging Settings
          </h3>

          <label className="flex items-center gap-3 mt-3">
            <input
              type="checkbox"
              checked={newRestaurant.packaging_enabled}
              onChange={(e) =>
                setNewRestaurant({
                  ...newRestaurant,
                  packaging_enabled: e.target.checked
                })
              }
            />
            Enable Packaging Charge
          </label>

          {newRestaurant.packaging_enabled && (
            <input
              type="number"
              placeholder="Packaging Charge (₹)"
              value={newRestaurant.packaging_charge}
              onChange={(e) =>
                setNewRestaurant({
                  ...newRestaurant,
                  packaging_charge: Number(e.target.value)
                })
              }
              className="border border-gray-300 p-3 rounded-xl w-full mt-3 text-gray-900"
            />
          )}




          <button
            onClick={addRestaurant}
            className="bg-[#ff5a1f] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Create Restaurant
          </button>

        </div>

      </div>

      {/* Restaurant List */}
      <div className="bg-white p-8 rounded-3xl shadow-md border border-orange-100">

        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          Restaurants
        </h2>

        {loading && <p className="text-gray-600">Loading...</p>}

        <div className="space-y-6">
          {restaurants.map(rest => (
            <div
              key={rest.id}
              className="flex justify-between items-center border-b border-gray-200 pb-4"
            >
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {rest.name}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Slug: /r/{rest.slug}
                </p>

                {rest.address && (
                  <p className="text-sm text-gray-500">
                    {rest.address}
                  </p>
                )}
              </div>

              <div className="flex gap-3">

                <button
                  onClick={() =>
                    router.push(`/admin/${rest.id}`)
                  }
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:opacity-90"
                >
                  Admin
                </button>

                <button
                  onClick={() =>
                    router.push(`/k/${rest.id}`)
                  }
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:opacity-90"
                >
                  Kitchen
                </button>

                <button
                  onClick={() =>
                    router.push(`/r/${rest.slug}`)
                  }
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:opacity-90"
                >
                  View Menu
                </button>

              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  )
}
