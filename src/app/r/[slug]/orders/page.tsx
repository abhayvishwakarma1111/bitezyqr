'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { formatTimeIST } from '@/lib/time'
import { useRef } from 'react';


export default function OrdersPage() {
    const params = useParams()
    const slug = params.slug as string
    const router = useRouter()


    const [orders, setOrders] = useState<any[]>([])
    const [customerId, setCustomerId] = useState<string | null>(null)
    const [restaurantId, setRestaurantId] = useState<string | null>(null)
    const [restaurantName, setRestaurantName] = useState<string>("");
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio('/ring.mp3');
        }
    }, []);

    // STEP 1 — Load session into state
    useEffect(() => {
        const storedCustomer = sessionStorage.getItem('customerId')
        const storedRestaurant = sessionStorage.getItem('restaurantId')

        if (storedCustomer && storedRestaurant) {
            setCustomerId(storedCustomer)
            setRestaurantId(storedRestaurant)
        }
    }, [])

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

    // STEP 2 — Fetch orders (depends on state)
    const fetchOrders = async () => {
  if (!customerId || !restaurantId) return

  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        quantity,
        menu_items ( name )
      )
    `)
    .eq('customer_id', customerId)
    .eq('restaurant_id', restaurantId)
    .eq('payment_status', 'PAID')
    .order('created_at', { ascending: false })

  if (!data) return

const today = new Date()
const todayString = today.toLocaleDateString('en-IN', {
  timeZone: 'Asia/Kolkata'
})

const filteredOrders = data.filter(order => {
  const orderDate = new Date(order.created_at)

  const orderDateString = orderDate.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata'
  })

  return orderDateString === todayString
})

setOrders(filteredOrders)

}


    useEffect(() => {
        if (!customerId || !restaurantId) return

        let channel: any

        const init = async () => {
            await fetchOrders()

            channel = supabase
                .channel(`customer-${customerId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'orders',
                        filter: `customer_id=eq.${customerId}`
                    },
                    (payload) => {
                        const newOrder = payload.new as { status?: string };
                        const oldOrder = payload.old as { status?: string };

                        console.log("Realtime fired:", newOrder.status, oldOrder.status);

                        if (newOrder.status === 'READY' && oldOrder.status !== 'READY') {
                            playReadySound();
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
    }, [customerId, restaurantId])

    // 3. Add the sound player function
    const playReadySound = () => {
        if (!audioRef.current) return;

        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => { });

        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    };

    useEffect(() => {
        const handleFocus = () => fetchOrders()
        window.addEventListener('focus', handleFocus)
        return () => window.removeEventListener('focus', handleFocus)
    }, [customerId, restaurantId])

    useEffect(() => {
        if (!customerId || !restaurantId) return;

        const interval = setInterval(() => {
            fetchOrders();
        }, 10000); // every 10 seconds

        return () => clearInterval(interval);
    }, [customerId, restaurantId]);


    return (
        <div className="min-h-screen bg-[#fff7f2] px-4 py-6 max-w-md mx-auto pb-32">

            <div className="mb-7 -mx-4 -my-6 bg-white shadow-sm pb-3 flex flex-col items-left">

                <div className="text-xl font-bold text-gray-900 px-5 mt-4">
                    Your Orders
                </div>
                {restaurantName && (
                    <div className="text-gray-400 font-bold text-sm px-4">| {restaurantName}</div>
                )}

            </div>

            {orders.length === 0 && (
                <p className="text-gray-500">No orders yet</p>
            )}

            <div className="space-y-6">
                {orders.map(order => {

                    let statusText = ''
                    let statusColor = ''

                    if (order.status === 'CREATED' || order.status === 'ACCEPTED') {
                        statusText = 'Preparing'
                        statusColor = 'bg-yellow-100 text-yellow-700 animate-pulse'
                    } else if (order.status === 'READY') {
                        statusText = 'Ready for pickup'
                        statusColor = 'bg-green-100 text-green-700'
                    } else if (order.status === 'PICKED_UP') {
                        statusText = 'Completed'
                        statusColor = 'bg-gray-100 text-gray-500'
                    }

                    return (
                        <div
                            key={order.id}
                            className="bg-white rounded-3xl p-5 shadow-md border border-orange-100"
                        >

                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-bold text-[#ff5a1f]">
                                    #{order.token_number}
                                </h2>

                                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                                    {statusText}
                                </div>
                            </div>

                            

                            <div className="space-y-1 text-gray-800 mb-7 border-t border-b border-gray-300 border-dotted">
                                {order.order_items?.map((item: any, index: number) => (
                                    <div key={index} className="flex justify-between ">
                                        <span>{item.menu_items?.name} x {item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center">

                              <p className="text-sm text-gray-500">
                                {formatTimeIST(order.created_at)}
                              </p>

                              <p className="text-sm font-medium text-gray-700 flex justify-end">
                                {statusText}
                              </p>

                            </div>

                        </div>
                    )
                })}
            </div>

            {/* Sticky Order More Button */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
                <button
                    onClick={() => router.push(`/r/${slug}/menu`)}
                    className="w-full bg-[#ff5a1f] text-white py-4 rounded-2xl font-semibold shadow-lg"
                >
                    Order More
                </button>
            </div>


        </div>
    )
}
