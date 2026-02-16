"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";


export default function MenuPage() {
  const router = useRouter();

  const params = useParams();
  const slug = params.slug as string;
  const DEFAULT_IMAGE ='https://iekmuvwagaxlrviuvvbo.supabase.co/storage/v1/object/public/menu-images/d100c56c-b88c-455a-ba80-c585a455ff39-1770640414979.png'


  const [menu, setMenu] = useState<any[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState<{ [key: string]: number }>({});

  const [activeOrder, setActiveOrder] = useState<any>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  const totalAmount = menu.reduce((total, item) => {
    const qty = cart[item.id] || 0;
    return total + qty * item.price;
  }, 0);

  const categories = [
    "All",
    ...Array.from(new Set(menu.map((item) => item.category).filter(Boolean))),
  ];

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
        .select("name")
        .eq("id", restaurantId)
        .single();

      if (data) {
        setRestaurantName(data.name);
      }
    };

    fetchRestaurant();
  }, [restaurantId]);


  

  useEffect(() => {
    if (!restaurantId) return;

    const fetchMenu = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("is_available", true);

      setMenu(data || []);
      setLoading(false);
    };

    fetchMenu();
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) return;

    const savedCart = localStorage.getItem(`bitezy-cart-${restaurantId}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) return;
    localStorage.setItem(`bitezy-cart-${restaurantId}`, JSON.stringify(cart));
  }, [cart, restaurantId]);

  useEffect(() => {
    const checkActiveOrder = async () => {
      const customerId = sessionStorage.getItem("customerId");
      const restaurantId = sessionStorage.getItem("restaurantId");

      if (!customerId || !restaurantId) return;

      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", customerId)
        .eq("restaurant_id", restaurantId)
        .neq("status", "PICKED_UP")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setActiveOrder(data);
      }
    };

    checkActiveOrder();
  }, []);

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

  const filteredMenu =
    selectedCategory === "All"
      ? menu
      : menu.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#fffaf5]">
      {/* Sticky Header */}
      <div className="bg-white shadow-sm pb-3 flex flex-col items-left">

        <div className="text-xl font-bold text-gray-900 px-5 mt-4">
          Menu
        </div>
        {restaurantName && (
          <div className="text-gray-400 font-bold text-sm px-4">| {restaurantName}</div>
        )}

      </div>

      {/* Category Chips */}
      <div className="overflow-x-auto no-scrollbar px-4 pt-4">
        <div className="flex gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition
          ${selectedCategory === category
                  ? "bg-[#ff5a1f] text-white"
                  : "bg-white text-gray-700 border border-gray-300"
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-md mx-auto pb-50">

        {loading ? (
          /* --- CASE 1: LOADING (The Skeleton) --- */
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex gap-4 animate-pulse">
              <div className="flex-1 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div> {/* Veg Icon placeholder */}
                <div className="h-5 bg-gray-300 rounded w-3/4"></div> {/* Name placeholder */}
                <div className="h-4 bg-gray-200 rounded w-full"></div> {/* Desc placeholder */}
                <div className="h-6 bg-gray-300 rounded w-1/4 mt-4"></div> {/* Price placeholder */}
              </div>
              <div className="w-28 h-28 bg-gray-200 rounded-xl"></div> {/* Image placeholder */}
            </div>
          ))
        ) : menu.length === 0 ? (
          /* --- CASE 2: EMPTY --- */
          <p className="text-gray-500 text-center">No items available</p>
        ) : null}

        {filteredMenu.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 relative"
          >
            {/* Left Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {/* Veg / Non-Veg Icon */}
                  <span> 
                  <div className={`w-4 h-4 border-2 flex items-center justify-center rounded-sm ${item.is_veg ? "border-green-600" : "border-red-600"}`}>
                    <div className={`w-2 h-2 rounded-full ${item.is_veg ? "bg-green-600" : "bg-red-600"}`} />
                  </div>
                  </span>

                {item.is_bestseller && (
                  <span className="bg-yellow-100 text-[#D60000] text-xs px-2 py-1 rounded-full">
                    🔥 Bestseller
                  </span>
                )}
              </div>

              <h2 className="font-semibold text-base text-gray-900">
                {item.name}
              </h2>

              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {item.description}
              </p>

              <p className="font-bold text-lg text-gray-900 mt-2">
                ₹{item.price}
              </p>
            </div>

            {/* Right Image + Add */}
            <div className="w-28 relative">
              <div className="w-28 h-28 relative flex-shrink-0">
                <Image
                  src={item.image_url || DEFAULT_IMAGE}
                  alt={item.name}
                  fill // This makes it fill the parent div
                  sizes="112px" // 28 * 4 = 112px
                  className="object-cover rounded-xl"
                />
              </div>


              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                {!cart[item.id] ? (
                  <button
                    onClick={() => increaseQty(item.id)}
                    className="bg-white border border-[#ff5a1f] text-[#ff5a1f] font-semibold px-6 py-1 rounded-lg shadow-sm"
                  >
                    ADD
                  </button>
                ) : (
                  <div className="flex items-center bg-white border border-[#ff5a1f] rounded-lg shadow-sm">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="px-3 py-1 text-[#ff5a1f] font-bold"
                    >
                      −
                    </button>

                    <span className="px-3 font-semibold text-gray-900">
                      {cart[item.id]}
                    </span>

                    <button
                      onClick={() => increaseQty(item.id)}
                      className="px-3 py-1 text-[#ff5a1f] font-bold"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#ff5a1f] text-white rounded-2xl shadow-lg px-6 py-4 flex justify-between items-center">
          <div>
            <p className="font-semibold">
              {totalItems} item{totalItems > 1 ? "s" : ""}
            </p>
            <p className="text-sm">₹{totalAmount}</p>
          </div>

          <button
            onClick={() => router.push(`/r/${slug}/checkout`)}
            className="font-semibold"
          >
            View Cart →
          </button>


        </div>
      )}

      {activeOrder && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black text-white rounded-2xl px-6 py-3 flex justify-between items-center shadow-lg">
          <div>
            <p className="text-sm">
              Your Token #{activeOrder.token_number}
            </p>
            <p className="text-xs text-gray-300">
              {activeOrder.status === "READY"
                ? "Ready for pickup"
                : "Preparing"}
            </p>
          </div>

          <button
            onClick={() =>
              router.push(`/r/${slug}/orders`)
            }
            className="font-semibold"
          >
            View →
          </button>

        </div>
      )}


    </div>
  );
}
