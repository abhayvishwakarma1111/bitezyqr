export default function HomePage() {
  return (
    <main className="bg-white text-gray-900">

      {/* HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 bg-gradient-to-br from-green-50 to-white">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-4xl">
          Make Your Restaurant <span className="text-green-600">Smart</span> With Bitezy
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl">
          QR based ordering, live kitchen dashboard, powerful analytics and zero commission.
          Digitize operations. Increase revenue. Reduce chaos.
        </p>

        <div className="mt-8 flex gap-4">
          <a
            href="#pricing"
            className="bg-green-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-green-700 transition"
          >
            View Pricing
          </a>

          <a
            href="#contact"
            className="border border-gray-300 px-8 py-3 rounded-xl text-lg font-semibold hover:bg-gray-100 transition"
          >
            Talk To Us
          </a>
        </div>
      </section>

      {/* APPLE STYLE PRODUCT SHOWCASE */}
      <section className="py-32 px-6 bg-white text-center">

        {/* SECTION 1 – ADMIN DASHBOARD */}
        <div className="max-w-6xl mx-auto mb-40">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Total Control.
          </h2>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-16">
            Real-time revenue. Live orders. Smart insights.
            Everything your restaurant needs — in one powerful dashboard.
          </p>

          <div className="rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-gray-200">
            <img
              src="/admin-dashboard.png"
              alt="Admin Dashboard"
              className="w-full object-cover"
            />
          </div>
        </div>

        {/* SECTION 2 – CUSTOMER EXPERIENCE */}
        <div className="max-w-6xl mx-auto mb-40">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Effortless Ordering.
          </h2>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-16">
            Customers scan. Order. Pay.
            No waiting. No confusion. Just smooth experience.
          </p>

          <div className="flex justify-center">
            <div className="w-72 rounded-[50px] border-[10px] border-black shadow-[0_30px_80px_rgba(0,0,0,0.25)] overflow-hidden">
              <img
                src="/customer-menu.png"
                alt="Customer Menu"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3 – KITCHEN DASHBOARD */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Kitchen, Simplified.
          </h2>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-16">
            Accept. Prepare. Ready. Picked up.
            A seamless workflow that keeps your kitchen in sync.
          </p>

          <div className="rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-gray-200 max-w-4xl mx-auto">
            <img
              src="/kitchen-dashboard.png"
              alt="Kitchen Dashboard"
              className="w-full object-cover"
            />
          </div>
        </div>

      </section>



      {/* FEATURES SECTION */}
      <section className="py-20 bg-gray-50 px-6">
        <h2 className="text-3xl font-bold text-center mb-16">
          Everything Your Restaurant Needs
        </h2>

        <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">

          {/* CUSTOMER */}
          <div>
            <h3 className="text-xl font-semibold mb-4">🍽 Customer Experience</h3>
            <ul className="text-gray-600 space-y-3">
              <li>• QR based instant ordering</li>
              <li>• Category filters for easy browsing</li>
              <li>• Veg / Non-veg indicators</li>
              <li>• Bestseller badges</li>
              <li>• Cross-selling section (People also love)</li>
              <li>• Packaging option</li>
              <li>• Notes for chef customization</li>
              <li>• Live order status tracking</li>
              <li>• Multiple orders support</li>
            </ul>
          </div>

          {/* KITCHEN */}
          <div>
            <h3 className="text-xl font-semibold mb-4">👨‍🍳 Kitchen Dashboard</h3>
            <ul className="text-gray-600 space-y-3">
              <li>• Real-time new order sound alerts</li>
              <li>• Accept → Preparing → Ready → Picked Up</li>
              <li>• Token verification system</li>
              <li>• Live order timer tracking</li>
              <li>• Automatic previous order archive</li>
              <li>• Secure login access</li>
            </ul>
          </div>

          {/* ADMIN */}
          <div>
            <h3 className="text-xl font-semibold mb-4">📊 Owner Analytics</h3>
            <ul className="text-gray-600 space-y-3">
              <li>• Total orders & revenue tracking</li>
              <li>• Unique customer tracking</li>
              <li>• Best selling items insights</li>
              <li>• Hour-wise sales charts</li>
              <li>• Downloadable Excel reports</li>
              <li>• Menu management control</li>
              <li>• Stock availability toggle</li>
            </ul>
          </div>

        </div>
      </section>

      {/* ADVANTAGES SECTION */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-12">
          Why Restaurants Choose Bitezy
        </h2>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div>
            <h3 className="text-lg font-semibold mb-2">⚡ Faster Service</h3>
            <p className="text-gray-600">Reduce waiting time and increase table turnover.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">📈 Increase Revenue</h3>
            <p className="text-gray-600">Cross-selling and upselling built-in.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">💳 Zero Commission</h3>
            <p className="text-gray-600">100% payment goes directly to your account.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">📊 Data Driven Decisions</h3>
            <p className="text-gray-600">Know your peak hours and best items.</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 bg-gray-900 text-white text-center px-6">
        <h2 className="text-3xl font-bold mb-8">Simple & Transparent Pricing</h2>

        <div className="max-w-xl mx-auto bg-white text-gray-900 shadow-2xl rounded-2xl p-10">
          <h3 className="text-2xl font-semibold mb-4">Bitezy Plan</h3>

          <p className="text-4xl font-bold text-green-600 mb-2">
            ₹999<span className="text-lg text-gray-500">/month</span>
          </p>

          <p className="text-gray-600 mb-6">
            ₹1999 one-time setup fee
          </p>

          <ul className="text-gray-600 space-y-2 mb-8">
            <li>✔ Full Smart Ordering System</li>
            <li>✔ Kitchen + Admin Dashboard</li>
            <li>✔ Analytics & Reports</li>
            <li>✔ Menu Management</li>
            <li>✔ No Commission</li>
            <li>✔ 7-Day Refund Guarantee</li>
          </ul>

          <a
            href="#contact"
            className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Get Started
          </a>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready To Make Your Restaurant Smart?</h2>

        <p className="text-gray-600 mb-10">
          Contact us and we will set up everything for you.
        </p>

        <div className="max-w-md mx-auto space-y-4">
          <input
            type="text"
            placeholder="Restaurant Name"
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />
          <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
            Submit
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-10 text-center">
        <p className="mb-2">© {new Date().getFullYear()} Bitezy. All rights reserved.</p>
        <p className="text-gray-400 text-sm">
          Contact: support@bitezyqr.in | +91-XXXXXXXXXX
        </p>
      </footer>

    </main>
  );
}
