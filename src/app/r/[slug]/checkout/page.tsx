"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function CheckoutPage() {
  const params = useParams();
  const slug = params.slug as string;

  const DEFAULT_IMAGE = 'https://iekmuvwagaxlrviuvvbo.supabase.co/storage/v1/object/public/menu-images/d100c56c-b88c-455a-ba80-c585a455ff39-1770640414979.png'

  const router = useRouter();

  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [menu, setMenu] = useState<any[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [packaging, setPackaging] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [breakdown, setBreakdown] = useState<any>(null)

  const [taxEnabled, setTaxEnabled] = useState(false)
  const [taxType, setTaxType] = useState<string | null>(null)
  const [taxPercentage, setTaxPercentage] = useState(0)
  const [packagingEnabled, setPackagingEnabled] = useState(false)
  const [packagingChargeValue, setPackagingChargeValue] = useState(0)



  

  useEffect(() => {
    const storedRestaurantId = sessionStorage.getItem("restaurantId");
    if (storedRestaurantId) {
      setRestaurantId(storedRestaurantId);
    }
  }, []);

  useEffect(() => {
    if (!restaurantId) return;

    const fetchRestaurant = async () => {
      const { data } = await supabase
        .from("restaurants")
        .select(`
  name,
  tax_enabled,
  tax_type,
  tax_percentage,
  packaging_enabled,
  packaging_charge
`)
        .eq("id", restaurantId)
        .single();

      if (data) {
        setRestaurantName(data.name);
        setTaxEnabled(data.tax_enabled)
        setTaxType(data.tax_type)
        setTaxPercentage(data.tax_percentage || 0)
        setPackagingEnabled(data.packaging_enabled)
        setPackagingChargeValue(data.packaging_charge || 0)

      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) return;

    const savedCart = localStorage.getItem(`bitezy-cart-${restaurantId}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } 

    const fetchMenu = async () => {
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurantId);

      setMenu(data || []);
    }; 

    fetchMenu();
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) return;

    localStorage.setItem(
      `bitezy-cart-${restaurantId}`,
      JSON.stringify(cart)
    );
  }, [cart, restaurantId]);

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }, [])



  const increaseQty = (id: string) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decreaseQty = (id: string) => {
    setCart((prev) => {
      const newQty = (prev[id] || 0) - 1;
      if (newQty <= 0) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const addonItems = menu.filter((item) => item.is_addon);

  const foodSubtotal = menu.reduce((total, item) => {
    const qty = cart[item.id] || 0;
    return total + qty * item.price;
  }, 0);

  let displaySubtotal = foodSubtotal
  let displayTax = 0
  let totalAfterTax = foodSubtotal

  if (taxEnabled && taxPercentage > 0) {
    if (taxType === "exclusive") {
      displayTax = foodSubtotal * (taxPercentage / 100)
      totalAfterTax = foodSubtotal + displayTax
    }

    if (taxType === "inclusive") {
      const basePrice = foodSubtotal / (1 + taxPercentage / 100)
      displayTax = foodSubtotal - basePrice
      displaySubtotal = basePrice
      totalAfterTax = foodSubtotal
    }
  }

  let displayPackaging = 0

  if (packagingEnabled && packaging) {
    displayPackaging = packagingChargeValue
  }

  const finalDisplayTotal = totalAfterTax + displayPackaging


  const handlePlaceOrder = async () => {
    if (!restaurantId) return;

    const customerId = sessionStorage.getItem("customerId");
    if (!customerId) {
      alert("Session expired");
      return;
    }

    if (finalDisplayTotal === 0) {
      alert("Cart is empty");
      return;
    }

    setLoading(true); 

    try {
      // 1️⃣ Create Razorpay order
      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          cart,
          customer_id: customerId,
          packaging_required: packaging,
          chef_note: note
        }),
      });

      const data = await response.json();
      setBreakdown(data)

      console.log("Razorpay API response:", data);

      const options = {
        key: data.razorpayKeyId,
        currency: "INR",
        order_id: data.razorpayOrderId,
        handler: function () {
          setPaymentProcessing(true);

          localStorage.removeItem(`bitezy-cart-${restaurantId}`);

          setTimeout(() => {
            router.replace(`/r/${slug}/orders`);
          }, 500);
        },
        modal: {
          ondismiss: function () {
            alert("Payment cancelled");
            router.push(`/r/${slug}/checkout`);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };


  const cartItems = menu.filter((item) => cart[item.id]);

  if (paymentProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ff5a1f] mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-800">
            Confirming your payment...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fff7f2] px-4 max-w-md mx-auto pb-32">

      <div className="mb-7 -mx-4 bg-white shadow-sm pb-3 flex flex-col items-left">

        <div className="text-xl font-bold text-gray-900 px-5 mt-4">
          Checkout
        </div>
        {restaurantName && (
          <div className="text-gray-400 font-bold text-sm px-4">| {restaurantName}</div>
        )}

      </div>

      {/* Cart Items */}
      {cartItems.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl p-4 mb-2 shadow-sm flex justify-between items-center"
        >
          <div>
            <h2 className="font-semibold text-gray-900">{item.name}</h2>
            <p className="text-gray-800 font-medium">₹{item.price}</p>
          </div>

          <div className="flex items-center border border-[#ff5a1f] rounded-lg bg-white">
            <button
              onClick={() => decreaseQty(item.id)}
              className="px-3 py-1 text-[#ff5a1f] font-bold text-lg"
            >
              −
            </button>
            <span className="px-3 font-semibold text-gray-900">
              {cart[item.id]}
            </span>
            <button
              onClick={() => increaseQty(item.id)}
              className="px-3 py-1 text-[#ff5a1f] font-bold text-lg"
            >
              +
            </button>
          </div>
        </div>
      ))}

      {/* Packaging */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 mt-6">
        <label className="flex items-center gap-3 text-gray-900 font-medium">
          <input
            type="checkbox"
            checked={packaging}
            onChange={(e) => setPackaging(e.target.checked)}
            className="w-5 h-5 accent-[#ff5a1f]"
          />
          Packaging required
        </label>
      </div>

      {/* Chef Note */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Note for chef
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border border-gray-400 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
          placeholder="Extra spicy, less oil..."
        />
      </div>

      {/* People Also Love */}
      {addonItems.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            People also love
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {addonItems.map((item) => (
              <div
                key={item.id}
                className="min-w-[140px] bg-white rounded-2xl p-3 shadow-sm"
              >

                <div className="relative w-full h-24 mb-3">
                  <Image
                    src={item.image_url || DEFAULT_IMAGE}
                    alt={item.name}
                    fill
                    sizes="140px"
                    className="object-cover rounded-xl"
                  />
                </div>


                <p className="font-semibold text-sm text-gray-900">
                  {item.name}
                </p>

                <p className="text-gray-800 text-sm mb-2">₹{item.price}</p>

                <button
                  onClick={() => increaseQty(item.id)}
                  className="w-full border border-[#ff5a1f] text-[#ff5a1f] rounded-lg py-1 text-sm font-semibold"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex justify-between text-gray-800">
          <span>Subtotal</span>
          <span>₹{displaySubtotal.toFixed(2)}</span>
        </div>

        {displayTax > 0 && (
          <div className="flex justify-between text-gray-800">
            <span>GST ({taxPercentage}%)</span>
            <span>₹{displayTax.toFixed(2)}</span>
          </div>
        )}

        {displayPackaging > 0 && (
          <div className="flex justify-between text-gray-800">
            <span>Packaging</span>
            <span>₹{displayPackaging.toFixed(2)}</span>
          </div>
        )}

        <hr className="my-2" />

        <div className="flex justify-between font-bold text-lg text-gray-900">
          <span>Total</span>
          <span>₹{finalDisplayTotal.toFixed(2)}</span>
        </div>
      </div>


      {/* Fixed Bottom Pay Button */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-[#ff5a1f] text-white py-4 rounded-2xl font-semibold text-lg shadow-md"
          >
            {loading ? "Placing Order..." : `Proceed to Pay ₹${finalDisplayTotal.toFixed(2)}
`}
          </button>
        </div>
      </div>
    </div>
  );
}
