'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { formatTimeIST } from '@/lib/time'
import { useRef } from 'react';


export default function KitchenDashboard() {

    const params = useParams()
    const restaurantId = params.restaurantId as string
    const router = useRouter()

    const [authorized, setAuthorized] = useState(false)
    const [restaurantName, setRestaurantName] = useState<string>("");
    


    useEffect(() => {
        const role = sessionStorage.getItem("staff_role")
        const restaurant = sessionStorage.getItem("restaurant_id")

        if (role !== "chef" || restaurant !== restaurantId) {
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



    const [activeOrders, setActiveOrders] = useState<any[]>([])
    const [completedOrders, setCompletedOrders] = useState<any[]>([])
    const [showCompleted, setShowCompleted] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [mounted, setMounted] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio('/new-order.mp3');
        }
    }, []);


    // 🔥 Live Clock
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        setMounted(true)
    }, [])

    const timeAgo = (dateString: string) => {
        const now = new Date().getTime()
        const orderTime = new Date(dateString).getTime()
        const diff = Math.floor((now - orderTime) / 60000)
        return `${diff} min ago`
    }

    const playNewOrderSound = () => {
        if (!audioRef.current) return;

        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => { });

        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    };

    const fetchOrders = async () => {
        const { data } = await supabase
            .from('orders')
            .select(`
        *,
        order_items (
          quantity,
          menu_items ( name )
        )
      `)
            .eq('restaurant_id', restaurantId)
            .eq('payment_status', 'PAID')
            .order('created_at', { ascending: true })

        if (!data) return

        setActiveOrders(
            data.filter(order => order.status !== 'PICKED_UP')
        )

        setCompletedOrders(
            data.filter(order => order.status === 'PICKED_UP')
        )
    }

    useEffect(() => {
        if (!restaurantId) return

        let channel: any

        const init = async () => {
            // 1️⃣ Always fetch latest data first
            await fetchOrders()

            // 2️⃣ Then attach realtime
            channel = supabase
                .channel(`kitchen-${restaurantId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'orders',
                        filter: `restaurant_id=eq.${restaurantId}`
                    },
                    (payload) => {
                        const newRow = payload.new as any;
                        const oldRow = payload.old as any;

                        // 🔔 Trigger ONLY when:
                        // 1. payment_status just changed TO PAID
                        // 2. AND order status is still CREATED
                        if (
                            payload.eventType === 'UPDATE' &&
                            oldRow?.payment_status !== 'PAID' &&
                            newRow?.payment_status === 'PAID' &&
                            newRow?.status === 'CREATED'
                        ) {
                            playNewOrderSound();
                        }

                        fetchOrders();
                    }
                )
                .subscribe()
        }

        init()

        return () => {
            if (channel) supabase.removeChannel(channel)
        }
    }, [restaurantId])


    useEffect(() => {
        const handleFocus = () => fetchOrders()
        window.addEventListener('focus', handleFocus)
        return () => window.removeEventListener('focus', handleFocus)
    }, [restaurantId])

    useEffect(() => {
        if (!restaurantId) return

        const interval = setInterval(() => {
            fetchOrders()
        }, 10000) // every 10 seconds

        return () => clearInterval(interval)
    }, [restaurantId])


    const updateStatus = async (orderId: string, newStatus: string) => {
        await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)

        await fetchOrders()
    }

    if (!authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Checking access...</p>
            </div>
        )
    }


    return (
        <div className="min-h-screen bg-[#fff7f2] p-6">

            {/* Header */}
            <div className="flex justify-between items-center mb-5 bg-[#2D3436] -mx-6 -mt-6 shadow-sm">
                <div className="px-7 py-4">
                <h1 className="text-3xl font-bold text-white">
                    Kitchen Dashboard
                </h1>
                <p className="text-sm text-gray-300 mt-2">| {restaurantName}</p>
                </div>

                <div className="text-lg font-semibold text-white px-7 py-4">
                    {mounted ? currentTime.toLocaleTimeString() : ''}
                </div>
            </div>

            {/* Active Orders */}
            <h2 className="text-xl font-bold text-white text-center mb-4 bg-[#ff6b35] p-3 rounded-2xl shadow-sm">
                Active Orders
            </h2>

            {activeOrders.length === 0 && (
                <div className="bg-white rounded-3xl p-10 shadow-md border border-orange-100 flex flex-col items-center justify-center text-center">

                    <div className="text-6xl mb-4">👨‍🍳</div>

                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        Kitchen is Calm
                    </h3>

                    <p className="text-gray-500 mb-4">
                        Waiting for new orders...
                    </p>

                    <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        System is Live
                    </div>

                </div>
            )}

            <div className="space-y-6 mb-9">
                {activeOrders.map(order => (
                    <div
                        key={order.id}
                        className="bg-white rounded-3xl p-6 shadow-md border border-orange-100"
                    >

                        {/* Token + Time */}
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-3xl font-bold text-[#ff5a1f]">
                                    #{order.token_number}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {formatTimeIST(order.created_at)} • {timeAgo(order.created_at)}
                                </p>
                            </div>

                            <span className="font-semibold text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                                {order.status}
                            </span>
                        </div>

                        {/* Items */}
                        <div className="space-y-1 border-b border-t border-dashed border-gray-400 py-2 mb-3">
                            {order.order_items?.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between text-gray-800 ">
                                    <span>{item.menu_items?.name} x {item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-end gap-3 pb-2 mb-4">

                           {order.packaging_required && (
                             <p className="text-sm text-white mb-2 bg-[#795548] justify-end flex rounded-xl p-2 w-max">
                                📦 Packaging Required
                             </p>
                          )}

                          {order.chef_note && (
                              <p className="text-sm text-[#856404] mb-2 bg-[#fff3cd] justify-end flex rounded-xl p-2 w-max">
                                📝 {order.chef_note}
                              </p>
                          )}

                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">

                            {order.status === 'CREATED' && (
                                <button
                                    onClick={() => updateStatus(order.id, 'ACCEPTED')}
                                    className="bg-blue-500 text-white px-5 py-2 rounded-xl"
                                >
                                    Accept
                                </button>
                            )}

                            {order.status === 'ACCEPTED' && (
                                <button
                                    onClick={() => updateStatus(order.id, 'READY')}
                                    className="bg-green-600 text-white px-5 py-2 rounded-xl"
                                >
                                    Ready
                                </button>
                            )}

                            {order.status === 'READY' && (
                                <button
                                    onClick={() => updateStatus(order.id, 'PICKED_UP')}
                                    className="bg-black text-white px-5 py-2 rounded-xl"
                                >
                                    Picked Up
                                </button>
                            )}

                        </div>

                    </div>
                ))}
            </div>

            {/* Completed Orders */}
            <div>

                <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="text-md font-semibold text-[#555555] mb-4 bg-[#dddddd] px-4 py-2 rounded-full shadow-sm"
                >
                    {showCompleted ? 'Hide' : 'Show'} Completed Orders ({completedOrders.length})
                </button>

                {showCompleted && (
                    <div className="space-y-1">
                        {completedOrders.map(order => (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200"
                            >
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold text-[#ff5a1f]">
                                        #{order.token_number}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {formatTimeIST(order.created_at)}
                                    </span>
                                </div>

                                <div className="space-y-1 text-sm text-gray-700 flex flex-wrap gap-5">
                                    {order.order_items?.map((item: any, index: number) => (
                                        <span key={index} className="flex justify-between">
                                            <span>{item.menu_items?.name} x {item.quantity}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

        </div>
    )
}
