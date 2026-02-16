'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from 'recharts'
import { PieChart, Pie, Cell, Legend } from 'recharts'
import * as XLSX from 'xlsx'
import { getISTDateKey, formatDateIST } from '@/lib/time'


export default function AdminDashboard() {
    const params = useParams()
    const router = useRouter()

    const restaurantId = params.restaurantId as string
    const [restaurantName, setRestaurantName] = useState<string>("");

    const [authorized, setAuthorized] = useState(false)


    useEffect(() => {
        const role = sessionStorage.getItem("staff_role")
        const restaurant = sessionStorage.getItem("restaurant_id")

        if (role !== "admin" || restaurant !== restaurantId) {
            router.push("/dashboard-login")
        } else {
            setAuthorized(true)
        }
    }, [restaurantId, router])

    useEffect(() => {
        if (!restaurantId) return;

        const fetchRestaurant = async () => {
            const { data } = await supabase
                .from("restaurants")
                .select("name")
                .eq("id", restaurantId)
                .single();

            if (data) {
                setRestaurantName(data.name);
            }
        };

        fetchRestaurant();
    }, [restaurantId]);



    const [orders, setOrders] = useState<any[]>([])
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [showOrders, setShowOrders] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)



    const fetchOrders = async () => {
        if (!restaurantId || !startDate || !endDate) return

        // Convert selected local date to IST start-of-day
        const startLocal = new Date(`${startDate}T00:00:00`)
        const endLocal = new Date(`${endDate}T23:59:59`)

        const start = new Date(`${startDate}T00:00:00+05:30`)
        const end = new Date(`${endDate}T23:59:59+05:30`)


        const { data } = await supabase
            .from('orders')
            .select(`
        *,
        order_items (
          quantity,
          price,
          menu_items ( name )
        )
      `)
            .eq('restaurant_id', restaurantId)
            .eq('payment_status', 'PAID')
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())

            .order('created_at', { ascending: false })

        setOrders(data || [])
    }

    useEffect(() => {
        if (!restaurantId) return

        const fetchRestaurantQR = async () => {
            const { data } = await supabase
                .from('restaurants')
                .select('qr_code')
                .eq('id', restaurantId)
                .single()

            if (data?.qr_code) {
                setQrCodeUrl(data.qr_code)
            }
        }

        fetchRestaurantQR()
    }, [restaurantId])


    useEffect(() => {
        const now = new Date()

        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')

        const localDate = `${year}-${month}-${day}`

        setStartDate(localDate)
        setEndDate(localDate)
    }, [])


    useEffect(() => {
        fetchOrders()
    }, [startDate, endDate])

    const totalRevenue = orders.reduce(
        (sum, order) => sum + order.total_amount,
        0
    )

    const totalOrders = orders.length

    const completedOrders = orders.filter(
        order => order.status === 'PICKED_UP'
    ).length

    const avgOrderValue =
        totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0

    const uniqueCustomers = new Set(
        orders.map(order => order.customer_id)
    ).size

    // Calculate Top Selling Items
    const topItemsMap: Record<string, { quantity: number; revenue: number }> = {}

    orders.forEach(order => {
        order.order_items?.forEach((item: any) => {
            const name = item.menu_items?.name
            const qty = item.quantity
            const price = item.price

            if (!topItemsMap[name]) {
                topItemsMap[name] = { quantity: 0, revenue: 0 }
            }

            topItemsMap[name].quantity += qty
            topItemsMap[name].revenue += qty * price
        })
    })

    const topItems = Object.entries(topItemsMap)
        .map(([name, data]) => ({
            name,
            quantity: data.quantity,
            revenue: data.revenue
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)


    const revenueByDayMap: Record<string, number> = {} 

    orders
        .filter(order => order.status === 'PICKED_UP')
        .forEach(order => {

            const dateKey = getISTDateKey(order.created_at)

            if (!revenueByDayMap[dateKey]) {
                revenueByDayMap[dateKey] = 0
            }

            revenueByDayMap[dateKey] += order.total_amount
        })

    const revenueByDay = Object.entries(revenueByDayMap)
        .sort(([a], [b]) => a.localeCompare(b)) // ensure chronological order
        .map(([dateKey, revenue]) => ({
            date: formatDateIST(dateKey), // display formatted
            revenue
        }))

    const statusCount: Record<string, number> = {}

    orders.forEach(order => {
        if (!statusCount[order.status]) {
            statusCount[order.status] = 0
        }
        statusCount[order.status]++
    })

    const statusData = Object.entries(statusCount).map(
        ([status, value]) => ({
            name: status,
            value
        })
    )

    const COLORS = ['#ffb703', '#219ebc', '#2a9d8f', '#adb5bd']

    // Calculate Orders by Hour
    const ordersByHourMap: Record<string, number> = {}

    // Initialize all 24 hours with 0 so the chart shows a full day
    for (let i = 0; i < 24; i++) {
        const hourLabel = i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`
        ordersByHourMap[hourLabel] = 0
    }

    orders.forEach(order => {
        // Convert UTC to IST hour
        const date = new Date(order.created_at)
        const hour = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).getHours()

        // Convert 24h to 12h label
        const label = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`

        ordersByHourMap[label]++
    })

    const hourlyData = Object.entries(ordersByHourMap).map(([hour, count]) => ({
        hour,
        orders: count
    }))





    const downloadReport = () => {
        if (orders.length === 0) return

        const worksheetData = [
            ['Bitezy Analytics Report'],
            [`From: ${startDate}`],
            [`To: ${endDate}`],
            [],
            ['Token', 'Customer ID', 'Amount', 'Status', 'Date'],
            ...orders.map(order => [
                order.token_number,
                order.customer_id,
                order.total_amount,
                order.status,
                formatDateIST(order.created_at)
            ])
        ]

        const ws = XLSX.utils.aoa_to_sheet(worksheetData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Report')

        XLSX.writeFile(wb, `report-${startDate}-to-${endDate}.xlsx`)
    }


    const setToday = () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')

        const today = `${year}-${month}-${day}`

        setStartDate(today)
        setEndDate(today)
    }

    const setThisWeek = () => {
        const now = new Date()
        const firstDay = new Date(now.setDate(now.getDate() - now.getDay()))
        const lastDay = new Date()

        const format = (date: Date) =>
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

        setStartDate(format(firstDay))
        setEndDate(format(lastDay))
    }

    const setThisMonth = () => {
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date()

        const format = (date: Date) =>
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

        setStartDate(format(firstDay))
        setEndDate(format(lastDay))
    }

    const downloadQR = () => {
        if (!qrCodeUrl) return

        const link = document.createElement('a')
        link.href = qrCodeUrl
        link.download = `restaurant-qr-${restaurantId}.png`
        document.body.appendChild(link)
        link.click()
    }


    if (!authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Checking access...</p>
            </div>
        )
    }





    return (
        <div className="min-h-screen bg-gray-50 p-8">

            <div className="mb-7 -mx-8 -my-8 bg-white shadow-sm pb-3 flex flex-col items-left">

                <div className="text-3xl font-bold text-[#ff5a1f] px-5 mt-4">
                    Admin Analytics
                </div>

                {restaurantName && (
                    <div className="text-gray-400 font-bold text-sm px-4">| {restaurantName}</div>
                )}

            </div>

            <div className="flex gap-4 mb-6">

                <button
                    onClick={fetchOrders}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                >
                    Refresh
                </button>

                <button
                    onClick={() => downloadReport()}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                    Download Report
                </button>

                <button
                    onClick={() => router.push(`/admin/${restaurantId}/menu`)}
                    className="bg-[#ff5a1f] text-white px-4 py-2 rounded-lg"
                >
                    Manage Menu
                </button>

            </div>


            {/* Date Filters */}
            <div className="flex gap-4 mb-8">
                <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="border border-gray-300 p-2 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="border border-gray-300 p-2 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
                />
            </div>



            <div className="flex gap-4 mb-8">
                <button onClick={setToday} className="bg-gray-800 text-white px-4 py-2 rounded-lg">
                    Today
                </button>
                <button onClick={setThisWeek} className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                    This Week
                </button>
                <button onClick={setThisMonth} className="bg-gray-600 text-white px-4 py-2 rounded-lg">
                    This Month
                </button>
            </div>


            {/* Summary Cards */}
            <div className="grid grid-cols-5 gap-6 mb-10">

                <div className="bg-white p-6 rounded-2xl shadow-md">
                    <p className="text-sm text-gray-600 font-bold">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md">
                    <p className="text-sm text-gray-600 font-bold">Completed Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{completedOrders}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md">
                    <p className="text-sm text-gray-600 font-bold">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{totalRevenue}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md">
                    <p className="text-sm text-gray-600 font-bold">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">₹{avgOrderValue}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md">
                    <p className="text-sm text-gray-600 font-bold">Unique Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{uniqueCustomers}</p>
                </div>


            </div>

            {/* Your QR Code Section */}
            <div className="bg-white p-6 rounded-2xl shadow-md mb-8 flex flex-col md:flex-row items-center justify-between gap-6">

                <div>
                    <h2 className="text-xl font-bold text-[#ff5a1f] mb-2">
                        Your Digital Menu QR
                    </h2>
                    <p className="text-gray-600 text-sm">
                        This is the active QR code for your tables. Scan to test, or download to print new table standees.
                    </p>

                    <button
                        onClick={downloadQR}
                        className="mt-4 bg-[#ff5a1f] text-white px-4 py-2 rounded-lg"
                    >
                        Download QR
                    </button>
                </div>

                {qrCodeUrl && (
                    <img
                        src={qrCodeUrl}
                        alt="Restaurant QR"
                        className="w-40 h-40 object-contain border rounded-lg"
                    />
                )}

            </div>


            {/* Top 10 Selling Items */}
            <div className="bg-white p-6 rounded-2xl shadow-md mb-10">
                <h2 className="text-xl font-bold text-[#ff5a1f] mb-4">
                    Top 10 Selling Items
                </h2>

                {topItems.length === 0 && (
                    <p className="text-gray-500">No data available</p>
                )}

                <div className="space-y-3">
                    {topItems.map((item, index) => (
                        <div
                            key={item.name}
                            className="flex justify-between items-center border-b pb-2"
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-700">
                                    #{index + 1}
                                </span>
                                <span className="text-gray-900 font-medium">
                                    {item.name}
                                </span>
                            </div>

                            <div className="text-right">
                                <p className="text-sm text-gray-700">
                                    {item.quantity} sold
                                </p>
                                <p className="font-semibold text-gray-900">
                                    ₹{item.revenue}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md mb-10">
                <h2 className="text-xl font-bold text-[#ff5a1f] mb-4">
                    Revenue Overview
                </h2>

                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#ff5a1f" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md mb-10">
                <h2 className="text-xl font-bold text-[#ff5a1f] mb-4">
                    Peak Ordering Hours (Rush Times)
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Tracks total orders across the selected date range to identify your busiest times.
                </p>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {/* AreaChart gives a nice "mountain" look to visualize volume */}
                        <BarChart data={hourlyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="hour"
                                tick={{ fontSize: 12 }}
                                interval={2} // Shows every 2nd hour to keep it clean on mobile
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar
                                dataKey="orders"
                                fill="#ff5a1f"
                                radius={[4, 4, 0, 0]}
                                name="Orders"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>




            <div className="bg-white p-6 rounded-2xl shadow-md mb-10">
                <h2 className="text-xl font-bold text-[#ff5a1f] mb-4">
                    Order Status Breakdown
                </h2>

                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={statusData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={100}
                            label
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>




            {/* Orders List */}


            <button
                onClick={() => setShowOrders(!showOrders)}
                className="bg-[#ff5a1f] text-white px-5 py-2 rounded-lg mb-6"
            >
                {showOrders ? 'Hide Orders' : 'Show Orders'}
            </button>

            {showOrders && (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm">

                            <div className="flex justify-between mb-4">
                                <div>
                                    <p className="font-semibold text-[#ff5a1f]">
                                        Token #{order.token_number}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatDateIST(order.created_at)}
                                    </p>
                                </div>
                                <p className="font-semibold text-gray-700">
                                    ₹{order.total_amount}
                                </p>
                            </div>

                            <div className="space-y-1 text-sm text-gray-700 flex flex-wrap gap-5">
                                {order.order_items?.map((item: any, index: number) => (
                                    <div key={index} className="flex justify-between">
                                        <span>{item.menu_items?.name} x {item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}
