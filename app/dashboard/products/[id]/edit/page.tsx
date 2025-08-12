'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type ProductPayload = {
  id: string
  name: string
  description?: string
  price: number
  brand: string
  model: string
  color?: string
  storage?: string
  condition: 'new' | 'like_new' | 'good' | 'fair'
  images: string[]
  stock: number
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = String(params.id)

  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [product, setProduct] = React.useState<ProductPayload | null>(null)

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`)
        if (res.ok) {
          const data = await res.json()
          setProduct(data.product as ProductPayload)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [productId])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!product) return
    setSaving(true)
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })
      if (res.ok) router.push('/dashboard')
      else alert('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div>Product not found</div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <main className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Edit Product</h1>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                className="w-full px-3 py-2 border rounded-md"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                className="w-full px-3 py-2 border rounded-md"
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input
                className="w-full px-3 py-2 border rounded-md"
                value={product.brand}
                onChange={(e) => setProduct({ ...product, brand: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <input
                className="w-full px-3 py-2 border rounded-md"
                value={product.model}
                onChange={(e) => setProduct({ ...product, model: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="number"
                min={0}
                className="w-full px-3 py-2 border rounded-md"
                value={product.stock}
                onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Condition</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={product.condition}
                onChange={(e) => setProduct({ ...product, condition: e.target.value as any })}
              >
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border rounded-md"
              value={product.description ?? ''}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </main>
    </div>
  )
}


