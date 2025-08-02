'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/navbar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Store, Shield } from 'lucide-react';

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

export default function Home() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === 'buyer') {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products.slice(0, 6)); // Show only 6 products on home
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Buy and Sell Phones
            <span className="block text-primary">With Confidence</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover the perfect device or sell yours to thousands of trusted buyers. 
            Safe, simple, and secure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Phones
              </Button>
            </Link>
            <Link href="/auth/signup?role=seller">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Start Selling
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Show products for buyers */}
      {session?.user?.role === 'buyer' && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Phones</h2>
              <Link href="/products">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No phones available yet.</p>
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
          </div>
        </section>
      )}

      {/* Show features for non-buyers or when not logged in */}
      {(!session || session?.user?.role !== 'buyer') && (
        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose PhoneMarket?</h2>
              <p className="text-muted-foreground">
                The best platform for buying and selling phones
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <Smartphone className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>For Buyers</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Browse through a curated selection of phones from verified sellers. 
                    Find the best deals on new and used devices with buyer protection.
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <Store className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>For Sellers</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    List your phones for sale in minutes. Reach thousands of potential 
                    buyers and manage your listings with our easy-to-use tools.
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Secure & Simple</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our platform ensures safe transactions with secure payments and 
                    dedicated support. Buy and sell with peace of mind.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
