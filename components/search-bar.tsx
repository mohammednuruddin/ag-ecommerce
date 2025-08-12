'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  price: number
  brand: string
  model: string
  images: string[]
  stock: number
}

type Props = {
  className?: string
}

export default function SearchBar({ className }: Props) {
  const [q, setQ] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<Product[]>([])
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const handle = setTimeout(async () => {
      if (q.trim().length < 2) {
        setResults([])
        return
      }
      setLoading(true)
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
        })
        if (res.ok) {
          const data = await res.json()
          setResults(data.products ?? [])
        }
      } finally {
        setLoading(false)
      }
    }, 450)
    return () => clearTimeout(handle)
  }, [q])

  return (
    <div className={cn('relative w-full', className)}>
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Search anything: e.g., phone with Google camera under $200"
        className="w-full h-11 rounded-full border px-5 text-[15px] bg-white/70 supports-[backdrop-filter]:bg-white/60 backdrop-blur outline-none focus:ring-2 focus:ring-ring focus:border-ring"
      />
      {open && (results.length > 0 || loading || q.trim().length >= 2) && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-xl border bg-white/80 supports-[backdrop-filter]:bg-white/70 backdrop-blur shadow-lg overflow-hidden z-50"
          onMouseDown={(e) => { /* keep focus inside */ e.preventDefault() }}
        >
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">Thinking…</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No results yet</div>
          ) : (
            <ul className="max-h-80 overflow-auto">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    <div className="size-10 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xs text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{p.brand} {p.model}</div>
                    </div>
                    <div className="text-[15px] font-semibold whitespace-nowrap">${p.price}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}


