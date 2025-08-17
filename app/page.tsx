'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Store, Shield } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

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
    // Always show products on the landing page
    fetchProducts();
  }, []);

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
    <>
      {/* Products first */}
      <section className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold">Latest Phones</h2>
            <div className="flex items-center gap-2">
              {session?.user?.role === 'seller' && (
                <Link href="/dashboard/products/new">
                  <Button size="sm">Add Product</Button>
                </Link>
              )}
              <Link href="/products">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="w-full aspect-square rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No phones available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group overflow-hidden p-0">
                  <div className="aspect-[4/5] relative overflow-hidden bg-muted">
                    {product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                    <div className="absolute left-3 top-3 flex gap-2">
                      <Badge variant="secondary" className="bg-white/80 backdrop-blur text-foreground">{product.brand}</Badge>
                    </div>
                    {product.stock === 0 && (
                      <div className="absolute right-3 top-3">
                        <Badge variant="secondary" className="bg-black text-white">Out</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{product.model}</p>
                      </div>
                      <Badge variant="outline" className="capitalize text-xs whitespace-nowrap">
                        {product.condition.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xl font-bold">€{product.price}</span>
                      <Link href={`/products/${product.id}`}>
                        <Button size="sm" disabled={product.stock === 0}>View</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hero secondary */}
      <section className="relative py-14 sm:py-16 md:py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(70%_60%_at_50%_20%,black,transparent)] bg-[linear-gradient(to_right,transparent_95%,theme(colors.border)),linear-gradient(to_bottom,transparent_95%,theme(colors.border))] bg-[size:22px_22px]" />
        <div className="max-w-5xl mx-auto text-center px-2 sm:px-4">
          <h1 className="text-[32px] sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
            Buy and Sell Phones
            <span className="block text-primary">With Confidence</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Discover the perfect device or sell yours to thousands of trusted buyers. Safe, simple, and secure.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto h-12 sm:h-11 px-6">
                Browse Phones
              </Button>
            </Link>
            <Link href="/auth/signup?role=seller">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 sm:h-11 px-6">
                Start Selling
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Show products for buyers */}
      {session?.user?.role === 'buyer' && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Phones</h2>
              <Link href="/products">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="w-full aspect-square rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No phones available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="group overflow-hidden p-0">
                    <div className="aspect-[4/5] relative overflow-hidden bg-muted">
                      {product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-muted-foreground">No image</span>
                        </div>
                      )}
                      <div className="absolute left-3 top-3 flex gap-2">
                        <Badge variant="secondary" className="bg-white/80 backdrop-blur text-foreground">{product.brand}</Badge>
                      </div>
                      {product.stock === 0 && (
                        <div className="absolute right-3 top-3">
                          <Badge variant="secondary" className="bg-black text-white">Out</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">{product.model}</p>
                        </div>
                        <Badge variant="outline" className="capitalize text-xs whitespace-nowrap">
                          {product.condition.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xl font-bold">€{product.price}</span>
                        <Link href={`/products/${product.id}`}>
                          <Button size="sm" disabled={product.stock === 0}>View</Button>
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
        <section className="py-16 bg-muted/50">
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
    </>
  );
}
