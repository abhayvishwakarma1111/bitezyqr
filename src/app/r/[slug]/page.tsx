'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function RestaurantLanding() {
    const router = useRouter()
    const params = useParams()
    const slug = params.slug as string

    const [restaurant, setRestaurant] = useState<any>(null)  // Stores the fetched restaurant details
    const [phone, setPhone] = useState('')  // Stores the user's inputted phone number
    const [loading, setLoading] = useState(false)  

    useEffect(() => {
        if (!slug) return

        const fetchRestaurant = async () => {
            const { data } = await supabase
                .from('restaurants')
                .select('*')
                .eq('slug', slug)  // Fetch the restaurant details based on the slug from the URL
                .single()   // We expect only one restaurant to match the slug, so we use .single() to get a single object instead of an array

            setRestaurant(data)  // Store the fetched restaurant details in the state   
        }

        fetchRestaurant()  
    }, [slug])  // This effect runs whenever the slug changes (i.e., when the component mounts or when the URL changes)

    const handleContinue = async () => {
        if (phone.length !== 10) {
            alert('Please enter a valid 10-digit mobile number')
            return
        }

        if (!/^[6-9]\d{9}$/.test(phone)) {
            alert('Enter a valid Indian mobile number')
            return
        }


        setLoading(true)  

        const { data: existing } = await supabase
            .from('customers')
            .select('*')
            .eq('phone', phone)
            .maybeSingle()

        let customerId  

        if (existing) {
            customerId = existing.id
        } else {
            const { data: newCustomer } = await supabase
                .from('customers')
                .insert([{ phone }])
                .select()
                .single()

            customerId = newCustomer?.id  
        }

        if (!customerId) { 
            alert('Something went wrong. Please try again.')
            setLoading(false)
            return
        }

        sessionStorage.setItem('customerId', customerId)
        sessionStorage.setItem('restaurantId', restaurant.id)

        router.push(`/r/${slug}/menu`)
    }

    if (!restaurant) return <div className="p-6">Loading...</div>

    return (
        <div className="min-h-screen bg-[#fff7f2] flex flex-col">

            {/* Top Banner */}
            <div className="bg-gradient-to-r from-[#ff5a1f] to-[#ff8e53] h-40 rounded-b-3xl relative flex flex-col items-center pt-8 pb-6">

                <h1 className="text-3xl font-bold text-white text-center px-4 drop-shadow-md">
                    {restaurant.name}
                </h1>

                {restaurant.logo_url && (
                    <img
                        src={restaurant.logo_url}
                        alt="logo"
                        className="w-24 h-24 rounded-full object-cover absolute -bottom-12"
                    />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center px-6 pt-11">

                <div className="mt-10 w-full max-w-sm">

                    <label className="block text-sm font-medium text-gray-700 mb-1 px-2">
                        Phn No.
                    </label>


                    <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter your mobile number"
                        value={phone}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '') // remove non-digits
                            if (value.length <= 10) {
                                setPhone(value)
                            }
                        }}
                        className="w-full bg-white border border-gray-400 rounded-xl p-4 text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
                    />

                    <button
                        onClick={handleContinue}
                        disabled={loading}
                        className="w-full bg-[#ff5a1f] text-white py-4 rounded-xl font-semibold text-lg mt-3 shadow-md active:scale-95 transition"
                    >
                        {loading ? 'Please wait...' : 'View Menu'}
                    </button>

                </div>

                {restaurant.address && (
                    <p className="text-gray-600 text-xs w-full text-left mt-11">
                    {restaurant.address}
                </p>
                )}

                {restaurant.line1 && (
                    <p className="text-gray-600 text-xs w-full text-left">
                        {restaurant.line1}
                    </p>
                )}

                {restaurant.line2 && (
                    <p className="text-gray-600 text-xs w-full text-left">
                        {restaurant.line2}
                    </p>
                )}

                {restaurant.line3 && (
                    <p className="text-gray-600 text-xs w-full text-left">
                        {restaurant.line3}
                    </p>
                )}

                {restaurant.line4 && (
                    <p className="text-gray-600 text-xs w-full text-left">
                        {restaurant.line4}
                    </p>
                )}

                {restaurant.line5 && (
                    <p className="text-gray-600 text-xs w-full text-left">
                        {restaurant.line5}
                    </p>
                )}

                <p className="text-xs text-[#ff5a1f] mt-4 absolute bottom-7">
                    Powered by Bitezy
                </p>

            </div>
        </div>
    )


}
