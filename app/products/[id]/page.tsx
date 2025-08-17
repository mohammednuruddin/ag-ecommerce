'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  model: string;
  color: string;
  storage: string;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  images: string[];
  stock: number;
  seller: {
    name: string;
    email: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setAddingToCart(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product!.id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        toast.success('Added to cart');
      } else {
        toast.error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <main className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center">Product not found</div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4">
             <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
               {product.images.length > 0 ? (
                 <Image
                   src={product.images[0]}
                   alt={product.name}
                   fill
                   sizes="(max-width: 768px) 100vw, 50vw"
                   className="object-cover"
                 />
               ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded overflow-hidden relative">
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      fill
                      sizes="(max-width: 768px) 25vw, 12vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-4 md:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{product.name}</h1>
              <p className="text-gray-600 text-sm sm:text-base">{product.brand} {product.model}</p>
            </div>
            
            <div className="text-2xl sm:text-3xl font-bold">€{product.price}</div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Condition:</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-sm capitalize">
                  {product.condition.replace('_', ' ')}
                </span>
              </div>
              
              {product.color && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">Color:</span>
                  <span>{product.color}</span>
                </div>
              )}
              
              {product.storage && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">Storage:</span>
                  <span>{product.storage}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Stock:</span>
                <span>{product.stock} available</span>
              </div>
            </div>
            
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600 text-sm sm:text-base">{product.description}</p>
              </div>
            )}
            
            <div className="border-t pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm font-medium">Sold by:</span>
                <span>{product.seller.name}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4">
                <Button
                  onClick={addToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className="flex-1"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                
                <Button variant="outline">
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}