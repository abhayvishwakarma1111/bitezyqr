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
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* Top Banner */}
            <div className="bg-gradient-to-br from-[#ff5a1f] to-[#ff8e53] pt-7 pb-20 flex flex-col items-center px-4">

                {restaurant.logo_url && (

                    <div
                        className="w-29 h-29 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-white/30 overflow-hidden">
                        <img
                            src={restaurant.logo_url}
                            alt="logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <h1 className="mt-4 text-2xl font-black text-white text-center drop-shadow-md uppercase tracking-tight">
                    {restaurant.name}
                </h1>


            </div>



            {/* Content */}
            <div className="flex-1 px-5 -mt-12">

                <div className="bg-white rounded-[2rem] shadow-xl py-8 px-5 max-w-sm mx-auto border border-gray-100">

                    <label className="block text-xs font-bold text-gray-400 mb-2 px-1">
                        Enter Phone Number
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
                        className="w-full bg-[#ff5a1f] text-white py-5 rounded-2xl font-black text-lg mt-4 shadow-lg shadow-orange-200 active:scale-95 transition-transform uppercase tracking-wider"
                    >
                        {loading ? 'Please wait...' : 'View Menu'}
                    </button>

                    {restaurant.address && (
                        <p className="text-gray-600 text-xs w-full text-center mt-5 flex flex-col items-center justify-center py-3 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white transition-colors px-2">
                            📍{restaurant.address}
                        </p>
                    )}

                    {restaurant.line1 && (
                        <p className="text-gray-500 text-xs w-full text-left mt-5 py-2 border-t border-gray-200">
                            {restaurant.line1}
                        </p>
                    )}

                    {restaurant.line2 && (
                        <p className="text-gray-500 text-xs w-full text-left py-2">
                            {restaurant.line2}
                        </p>
                    )}

                    {restaurant.line3 && (
                        <p className="text-gray-500 text-xs w-full text-left py-2">
                            {restaurant.line3}
                        </p>
                    )}

                    {restaurant.line4 && (
                        <p className="text-gray-500 text-xs w-full text-left py-2">
                            {restaurant.line4}
                        </p>
                    )}

                    {restaurant.line5 && (
                        <p className="text-gray-500 text-xs w-full text-left py-2 border-b border-gray-200">
                            {restaurant.line5}
                        </p>
                    )}



                </div>

                

                

                <p className="text-xs text-center text-[#ff5a1f] mt-15 mb-5">
                    Powered by Bitezy
                </p>

            </div>

        </div>
    )


}
