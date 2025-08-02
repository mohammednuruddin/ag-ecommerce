'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  price: number;
  brand: string;
  model: string;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  images: string[];
  stock: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Phones</h1>
            <p className="text-muted-foreground">Browse our collection of quality devices</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No phones available yet.</p>
            <Link href="/auth/signup?role=seller">
              <Button>Be the first to sell</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative overflow-hidden bg-muted">
                  {product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <Badge variant="secondary" className="text-white bg-black/50">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{product.brand} {product.model}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">${product.price}</span>
                      <Badge variant="outline" className="capitalize text-xs">
                        {product.condition.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Link href={`/products/${product.id}`} className="block">
                      <Button size="sm" className="w-full text-xs" disabled={product.stock === 0}>
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}