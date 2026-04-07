'use client';

import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types/database';
import { useCartStore } from '@/store/cartStore';
import { trackEvent } from '@/components/GoogleAnalytics';

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    trackEvent('add_to_cart', { product_name: product.name });
    addItem(product);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={product.is_out_of_stock}
      className={`w-full flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-bold text-lg transition-all ${
        product.is_out_of_stock 
          ? 'bg-background-tertiary text-text-support cursor-not-allowed' 
          : 'bg-primary hover:bg-primary-hover text-background-main hover:scale-[1.02] active:scale-[0.98]'
      }`}
    >
      <ShoppingCart className="w-6 h-6" />
      {product.is_out_of_stock ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
    </button>
  );
}
