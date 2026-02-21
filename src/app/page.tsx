'use client';
import Image from "next/image";
import { useState } from "react";


export default function HomePage() {

  const [restaurantName, setRestaurantName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");



  return (
    <main className="bg-white text-gray-900 pt-20">

      {/* ================= HEADER ================= */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3">

          <Image
            src="/bitezy-logo.png"
            alt="Bitezy Logo"
            width={120}
            height={40}
            priority
          />

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-black">Features</a>
            <a href="#pricing" className="hover:text-black">Pricing</a>
            <a href="#faq" className="hover:text-black">FAQ</a>
          </nav>

          <a
            href="/dashboard-login"
            className="px-4 py-2 rounded-full bg-black text-white text-xs md:text-sm font-medium hover:bg-gray-800 transition"
          >
            Dashboard Login
          </a>
        </div>
      </header>


      {/* ================= HERO ================= */}
      <section className="min-h-[90vh] flex flex-col justify-center items-center text-center px-4 bg-gradient-to-br from-green-50 to-white">

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight max-w-4xl">
          Increase Revenue & Speed Up Service —
          <span className="text-green-600"> Without Paying Commission</span>
        </h1>

        <p className="mt-6 text-base md:text-xl text-gray-600 max-w-2xl">
          Smart QR ordering system with live kitchen dashboard and real-time analytics.
          Built for modern restaurants.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <a
            href="#contact"
            className="bg-green-600 text-white px-6 md:px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Inquire
          </a>

          <a
            href="#features"
            className="border border-gray-300 px-6 md:px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Explore Features
          </a>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Trusted by growing restaurants in all over India
        </p>
      </section>

      {/* ================= PRODUCT SHOWCASE ================= */}
      <section className="py-24 bg-white px-6">

        <div className="max-w-7xl mx-auto space-y-24">

          {/* ADMIN DASHBOARD */}
          <div className="grid md:grid-cols-2 gap-12 items-center">

            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Powerful Admin Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Track revenue, monitor orders and analyze peak hours with detailed insights.
              </p>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>✔ Total revenue tracking</li>
                <li>✔ Track best selling items</li>
                <li>✔ Sales graphs & reports</li>
                <li>✔ Downloadable Excel reports</li>
                <li>✔ Peak hour analysis</li>
              </ul>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.15)] border border-gray-200">
              <Image
                src="/mockups/admin1.png"
                alt="Admin Dashboard"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
            </div>

          </div>


          {/* KITCHEN DASHBOARD */}
          <div className="grid md:grid-cols-2 gap-12 items-center">

            <div className="order-2 md:order-1 rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.15)] border border-gray-200">
              <Image
                src="/mockups/kitchen1.png"
                alt="Kitchen Dashboard"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
            </div>

            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Real-Time Kitchen Flow
              </h2>
              <p className="text-gray-600 mb-6">
                Orders appear instantly with sound alerts and preparation status tracking.
              </p>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>✔ Accept → Preparing → Ready</li>
                <li>✔ Order timer tracking</li>
                <li>✔ Token verification system</li>
                <li>✔ Automatic archive system</li>
              </ul>
            </div>

          </div>


          {/* CUSTOMER EXPERIENCE */}
          <div>

            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Seamless Customer Experience
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                From scanning QR to order pickup — smooth and intuitive journey.
              </p>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6">

              {["csx1.jpeg", "csx2.jpeg", "csx3.jpeg", "csx3-1.jpeg", "csx4.jpeg"].map((img, index) => (
                <div
                  key={index}
                  className="min-w-[220px] md:min-w-[260px] rounded-[40px] border-[8px] md:border-[10px] border-black shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden"
                >
                  <Image
                    src={`/mockups/${img}`}
                    alt="Customer Experience"
                    width={300}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
              ))}

            </div>

          </div>

        </div>

      </section>



      {/* ================= SOCIAL PROOF ================= */}
      <section className="py-16 bg-white text-center">
        <h3 className="text-2xl font-semibold mb-4">
          Helping restaurants increase revenue by 24%+
        </h3>

        <p className="text-gray-600 max-w-xl mx-auto">
          “Bitezy reduced our waiting time and improved order accuracy.
          Customers love the QR system.”
        </p>

        <p className="mt-4 text-yellow-500 font-semibold">
          ⭐⭐⭐⭐⭐ 4.8/5 Average Rating
        </p>
      </section>


      {/* ================= PROBLEM → SOLUTION ================= */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Before Bitezy
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li>❌ Staff shouting in kitchen</li>
              <li>❌ Long customer waiting time</li>
              <li>❌ No proper sales data</li>
              <li>❌ Paying commission to aggregators</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-green-600">
              After Bitezy
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li>✅ Real-time digital order flow</li>
              <li>✅ Faster table turnover</li>
              <li>✅ Live revenue analytics</li>
              <li>✅ 100% payment directly to you</li>
            </ul>
          </div>

        </div>
      </section>


      {/* ================= FEATURES ================= */}
      <section id="features" className="py-20 text-center px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-12">
          Everything Your Restaurant Needs
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto text-gray-600">

          <div>
            <h3 className="font-semibold mb-3">Customer Experience</h3>
            <p>QR ordering, filters, cross-selling & live order tracking.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Kitchen Dashboard</h3>
            <p>Real-time order alerts with preparation tracking.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Owner Analytics</h3>
            <p>Revenue insights, peak hour data & Excel exports.</p>
          </div>

        </div>
      </section>


      {/* ================= PRICING ================= */}
      <section id="pricing" className="py-20 bg-gray-900 text-white text-center px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">
          Simple & Transparent Pricing
        </h2>

        <div className="max-w-xl mx-auto bg-white text-gray-900 rounded-2xl p-8 shadow-2xl">
          <h3 className="text-xl font-semibold mb-4">Bitezy Plan</h3>

          <p className="text-3xl font-bold text-green-600 mb-2">
            ₹999<span className="text-lg text-gray-500">/month</span>
          </p>

          <p className="text-gray-600 mb-4">
            ₹1999 one-time setup fee
          </p>

          <ul className="text-gray-600 space-y-2 mb-6 text-sm">
            <li>✔ Full Smart Ordering System</li>
            <li>✔ Kitchen + Admin Dashboard</li>
            <li>✔ Analytics & Reports</li>
            <li>✔ 7-Day Free Trial</li>
          </ul>

          <div className="text-xs text-gray-500 mb-6">
            🔒 Secure Payments • ⚡ Setup in 48 Hours • 📞 Dedicated Support
          </div>

          <a
            href="#contact"
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Get Started
          </a>
        </div>
      </section>


      {/* ================= FAQ ================= */}
      <section id="faq" className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6 text-gray-600">
          <div>
            <h3 className="font-semibold">Do I need new hardware?</h3>
            <p>No. Works on your existing phone, tablet or laptop.</p>
          </div>

          <div>
            <h3 className="font-semibold">How do payments work?</h3>
            <p>Payments go directly to your Razorpay account.</p>
          </div>

          <div>
            <h3 className="font-semibold">Can I customize menu anytime?</h3>
            <p>Yes. You get full admin access to edit items & pricing.</p>
          </div>
        </div>
      </section>


      {/* ================= CONTACT ================= */}
      <section id="contact" className="py-20 bg-gray-50 text-center px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          Ready To Digitize Your Restaurant?
        </h2>

        <div className="max-w-md mx-auto space-y-4">

          <input
            type="text"
            placeholder="Restaurant Name"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
          />

          <input
            type="text"
            placeholder="Owner Name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
          />

          <button
            onClick={async () => {
              setLoading(true);
              setMessage("");

              const res = await fetch("/api/contact", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  restaurant_name: restaurantName,
                  owner_name: ownerName,
                  phone: phone,
                }),
              });

              const data = await res.json();

              if (res.ok) {
                setMessage("✅ Request received! We'll contact you soon.");
                setRestaurantName("");
                setOwnerName("");
                setPhone("");
              } else {
                setMessage("❌ Something went wrong. Try again.");
              }

              setLoading(false);
            }}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            {loading ? "Submitting..." : "Request Demo"}
          </button>

          {message && (
            <p className="text-sm text-gray-600 mt-2">
              {message}
            </p>
          )}

        </div>

      </section>


      {/* ================= WHATSAPP BUTTON ================= */}
      <a
        href="https://wa.me/919516268462"
        target="_blank"
        className="fixed bottom-6 right-6 bg-green-500 text-white px-5 py-3 rounded-full shadow-lg hover:bg-green-600 transition text-sm font-semibold"
      >
        💬 Chat on WhatsApp
      </a>


      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-white py-8 text-center text-sm">
        <p>© {new Date().getFullYear()} Bitezyqr. All rights reserved.</p>
        <p className="text-gray-400 mt-2">
          help.bitezy@gmail.com | +91-9516268462
        </p>
      </footer>

    </main>
  );
}
