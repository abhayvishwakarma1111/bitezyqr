'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function ManageMenu() {
  const params = useParams()
  const restaurantId = params.restaurantId as string
  const router = useRouter()

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


  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')


  const [categories, setCategories] = useState<string[]>([])
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)


  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editedItem, setEditedItem] = useState<any>({})

  const [showAddForm, setShowAddForm] = useState(false)

  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image_url: '',
    is_veg: true,
    is_bestseller: false,
    is_addon: false,
    is_available: true,
  })

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setItems(data || [])

    const uniqueCategories = Array.from(
      new Set((data || []).map(item => item.category).filter(Boolean))
    )

    setCategories(uniqueCategories)

    setLoading(false)

  }

  useEffect(() => {
    if (restaurantId) {
      fetchItems()
    }
  }, [restaurantId])

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(error)
      return
    }

    fetchItems()
  }

  const saveChanges = async (id: string) => {
    const { error } = await supabase
      .from('menu_items')
      .update({
        name: editedItem.name,
        price: editedItem.price,
        description: editedItem.description,
        category: editedItem.category,
        image_url: editedItem.image_url
      })
      .eq('id', id)

    if (error) {
      console.error(error)
      return
    }

    setEditingItemId(null)
    fetchItems()
  }

  const addNewItem = async () => {
    if (!newItem.name || !newItem.price) {
      alert('Name and Price required')
      return
    }

    const { error } = await supabase
      .from('menu_items')
      .insert([
        {
          restaurant_id: restaurantId,
          name: newItem.name,
          price: Number(newItem.price),
          description: newItem.description,
          category: newItem.category,
          image_url: newItem.image_url,
          is_veg: newItem.is_veg,
          is_bestseller: newItem.is_bestseller,
          is_addon: newItem.is_addon,
          is_available: newItem.is_available,
        },
      ])

    if (error) {
      console.error('Insert error:', error)
      alert(error.message)
      return
    }

    setShowAddForm(false)

    setNewItem({
      name: '',
      price: '',
      description: '',
      category: '',
      image_url: '',
      is_veg: true,
      is_bestseller: false,
      is_addon: false,
      is_available: true,
    })

    fetchItems()
  }

  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${restaurantId}-${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from('menu-images')
      .upload(fileName, file)

    if (error) {
      console.error(error)
      alert('Image upload failed')
      return
    }

    const { data } = supabase.storage
      .from('menu-images')
      .getPublicUrl(fileName)

    setNewItem(prev => ({
      ...prev,
      image_url: data.publicUrl
    }))
  }

  const handleEditImageUpload = async (file: File, itemId: string) => {
  try {
    // 1️⃣ Delete old image if exists
    if (editedItem?.image_url) {
      const oldPath = editedItem.image_url.split('/menu-images/')[1]

      if (oldPath) {
        await supabase.storage
          .from('menu-images')
          .remove([oldPath])
      }
    }

    // 2️⃣ Upload new image
    const fileExt = file.name.split('.').pop()
    const fileName = `${restaurantId}-${itemId}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(fileName, file)

    if (uploadError) {
      console.error(uploadError)
      alert('Image upload failed')
      return
    }

    // 3️⃣ Get public URL
    const { data } = supabase.storage
      .from('menu-images')
      .getPublicUrl(fileName)

    // 4️⃣ Update local state
    setEditedItem((prev: any) => ({
      ...prev,
      image_url: data.publicUrl
    }))

  } catch (err) {
    console.error('Image replace error:', err)
  }
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

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#ff5a1f]">
          Manage Menu
        </h1>

        <button
          onClick={() => router.push(`/admin/${restaurantId}`)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Add New Item Section */}
      <div className="bg-white p-6 rounded-2xl shadow-md mb-8">

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#ff5a1f] text-white px-4 py-2 rounded-lg"
        >
          {showAddForm ? 'Close Form' : 'Add New Item'}
        </button>

        {showAddForm && (
          <div className="mt-6 space-y-4">

            <input
              type="text"
              placeholder="Item Name"
              value={newItem.name}
              onChange={e =>
                setNewItem({ ...newItem, name: e.target.value })
              }
              className="border border-gray-300 p-2 rounded-lg w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
            />

            <input
              type="number"
              placeholder="Price"
              value={newItem.price}
              onChange={e =>
                setNewItem({ ...newItem, price: e.target.value })
              }
              className="border border-gray-300 p-2 rounded-lg w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
            />

            <textarea
              placeholder="Description"
              value={newItem.description}
              onChange={e =>
                setNewItem({ ...newItem, description: e.target.value })
              }
              className="border border-gray-300 p-2 rounded-lg w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
            />

            <select
              value={newItem.category}
              onChange={e => {
                if (e.target.value === '__new__') {
                  setShowNewCategoryInput(true)
                  setNewItem({ ...newItem, category: '' })
                } else {
                  setShowNewCategoryInput(false)
                  setNewItem({ ...newItem, category: e.target.value })
                }
              }}
              className="border border-gray-300 p-2 rounded-lg w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__new__">+ Add New Category</option>
            </select>

            {showNewCategoryInput && (
              <input
                type="text"
                placeholder="New Category Name"
                value={newItem.category}
                onChange={e =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
                className="border border-gray-300 p-2 rounded-lg w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleImageUpload(e.target.files[0])
                }
              }}
              className="border border-gray-300 p-2 rounded-lg w-full bg-white"
            />



            <div className="flex gap-6 flex-wrap">

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newItem.is_veg}
                  onChange={e =>
                    setNewItem({ ...newItem, is_veg: e.target.checked })
                  }
                />
                Veg
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newItem.is_bestseller}
                  onChange={e =>
                    setNewItem({ ...newItem, is_bestseller: e.target.checked })
                  }
                />
                Bestseller
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newItem.is_addon}
                  onChange={e =>
                    setNewItem({ ...newItem, is_addon: e.target.checked })
                  }
                />
                Add-on
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newItem.is_available}
                  onChange={e =>
                    setNewItem({ ...newItem, is_available: e.target.checked })
                  }
                />
                Available
              </label>

            </div>

            <button
              onClick={addNewItem}
              className="bg-green-600 text-white px-5 py-2 rounded-lg"
            >
              Save Item
            </button>

          </div>
        )}

      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search menu item..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border border-gray-300 p-3 rounded-xl w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]"
        />
      </div>


      {loading && <p>Loading...</p>}

      {/* Items List */}
      <div className="space-y-6">
        {items
          .filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(item => (

            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl shadow-md"
            >

              <div className="flex justify-between items-start gap-6">

                <div className="flex-1">
                  {editingItemId === item.id ? (
                    <div className="space-y-3">

                      <img
                        src={
                          editedItem.image_url ||
                          'https://iekmuvwagaxlrviuvvbo.supabase.co/storage/v1/object/public/menu-images/d100c56c-b88c-455a-ba80-c585a455ff39-1770640414979.png'
                        }
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg mb-3"
                      />

                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            handleEditImageUpload(e.target.files[0], item.id)
                          }
                        }}
                        className="border border-gray-300 p-2 rounded-lg w-full bg-white mb-3"
                      />


                      <input
                        type="text"
                        value={editedItem.name}
                        onChange={e =>
                          setEditedItem({ ...editedItem, name: e.target.value })
                        }
                        className="border border-gray-300 p-2 rounded-lg w-full bg-white text-gray-900"
                      />

                      <input
                        type="number"
                        value={editedItem.price}
                        onChange={e =>
                          setEditedItem({ ...editedItem, price: Number(e.target.value) })
                        }
                        className="border border-gray-300 p-2 rounded-lg w-full bg-white text-gray-900"
                      />

                      <textarea
                        value={editedItem.description}
                        onChange={e =>
                          setEditedItem({ ...editedItem, description: e.target.value })
                        }
                        className="border border-gray-300 p-2 rounded-lg w-full bg-white text-gray-900"
                      />

                      <input
                        type="text"
                        value={editedItem.category}
                        onChange={e =>
                          setEditedItem({ ...editedItem, category: e.target.value })
                        }
                        className="border border-gray-300 p-2 rounded-lg w-full bg-white text-gray-900"
                      />

                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {item.name}
                      </h2>
                      <p className="text-gray-600 font-medium">
                        ₹{item.price}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {item.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        Category: {item.category || 'Uncategorized'}
                      </p>
                    </div>
                  )}

                </div>

                <img
                  src={
                    item.image_url ||
                    'https://iekmuvwagaxlrviuvvbo.supabase.co/storage/v1/object/public/menu-images/d100c56c-b88c-455a-ba80-c585a455ff39-1770640414979.png'
                  }
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg mb-3"
                />



                <div className="flex flex-col gap-3">

                  <button
                    onClick={() => {
                      setEditingItemId(item.id)
                      setEditedItem(item)
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg"
                  >
                    Edit
                  </button>


                  <button
                    onClick={() => deleteItem(item.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg"
                  >
                    Delete
                  </button>

                </div>

              </div>

              <div className="flex gap-6 mt-4 flex-wrap">

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={item.is_available}
                    onChange={async () => {
                      await supabase
                        .from('menu_items')
                        .update({ is_available: !item.is_available })
                        .eq('id', item.id)
                      fetchItems()
                    }}
                  />
                  Available
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={item.is_bestseller}
                    onChange={async () => {
                      await supabase
                        .from('menu_items')
                        .update({ is_bestseller: !item.is_bestseller })
                        .eq('id', item.id)
                      fetchItems()
                    }}
                  />
                  Bestseller
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={item.is_addon}
                    onChange={async () => {
                      await supabase
                        .from('menu_items')
                        .update({ is_addon: !item.is_addon })
                        .eq('id', item.id)
                      fetchItems()
                    }}
                  />
                  Add-on
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={item.is_veg}
                    onChange={async () => {
                      await supabase
                        .from('menu_items')
                        .update({ is_veg: !item.is_veg })
                        .eq('id', item.id)
                      fetchItems()
                    }}
                  />
                  Veg
                </label>

              </div>

              {editingItemId === item.id && (
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => saveChanges(item.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Save
                  </button>

                  <button
                    onClick={() => setEditingItemId(null)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              )}



            </div>
          ))}

      </div>

    </div>
  )
}
