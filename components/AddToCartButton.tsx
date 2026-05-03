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

  if (product.is_out_of_stock) {
    return (
      <button
        onClick={() => {
          window.open(`https://wa.me/5547988692150?text=${encodeURIComponent(`Olá! Me avise quando o produto ${product.name} voltar ao estoque.`)}`, '_blank');
        }}
        className="w-full flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-bold text-lg transition-all bg-accent hover:bg-accent/80 text-background-main hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      >
        <ShoppingCart className="w-6 h-6 hidden" />
        Avise-me
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      className="w-full flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-bold text-lg transition-all bg-primary hover:bg-primary-hover text-background-main hover:scale-[1.02] active:scale-[0.98]"
    >
      <ShoppingCart className="w-6 h-6" />
      Adicionar ao Carrinho
    </button>
  );
}
