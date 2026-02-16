'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function DashboardLogin() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    const handleLogin = async () => {
        const { data } = await supabase
            .from("restaurants")
            .select("*")
            .eq("dashboard_username", username)
            .single()

        if (!data) {
            alert("Invalid username")
            return
        }

        // Admin login
        if (password === data.admin_password) {
            sessionStorage.setItem("staff_role", "admin")
            sessionStorage.setItem("restaurant_id", data.id)
            router.push(`/admin/${data.id}`)
            return
        }

        // Chef login
        if (password === data.chef_password) {
            sessionStorage.setItem("staff_role", "chef")
            sessionStorage.setItem("restaurant_id", data.id)
            router.push(`/k/${data.id}`)
            return
        }

        alert("Invalid password")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fff7f2]">
            <div className="bg-white p-10 rounded-3xl shadow-lg w-96">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">
                    Dashboard Login
                </h1>

                <input
                    type="text"
                    placeholder="Username"
                    className="border p-3 w-full mb-4 rounded-xl text-gray-900"
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="border p-3 w-full mb-6 rounded-xl text-gray-900"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    className="w-full bg-[#ff5a1f] text-white py-3 rounded-xl"
                >
                    Login
                </button>
            </div>
        </div>
    )
}
