'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types/database';
import { useCartStore } from '@/store/cartStore';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const getImageUrl = (product: Product) => {
    if (Array.isArray(product.image_urls) && product.image_urls.length > 0 && typeof product.image_urls[0] === 'string' && product.image_urls[0].startsWith('http')) {
      return product.image_urls[0];
    }
    return 'https://via.placeholder.com/400';
  };

  return (
    <Link href={`/${product.sku}`} className="group flex flex-col bg-background-secondary rounded-xl overflow-hidden border border-background-tertiary hover:border-primary transition-colors duration-300 relative">
      {product.is_out_of_stock && (
        <div className="absolute top-3 right-3 z-10 bg-danger text-white text-xs font-bold px-2 py-1 rounded">
          Esgotado
        </div>
      )}
      
      <div className="relative aspect-square w-full overflow-hidden bg-background-tertiary">
        <Image
          src={getImageUrl(product)}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs text-accent font-medium mb-1 uppercase tracking-wider">{product.category}</div>
        <h3 className="text-lg font-semibold text-text-main mb-2 line-clamp-2">{product.name}</h3>
        
        <div className="mt-auto pt-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-success">
              {formatCurrency(product.pix_price)} <span className="text-xs font-normal text-text-support">no PIX</span>
            </span>
            <span className="text-sm text-text-support mt-1">
              Em até 4x de {formatCurrency(product.card_price / 4)} sem juros no cartão (Total: {formatCurrency(product.card_price)})
            </span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.is_out_of_stock}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-colors ${
              product.is_out_of_stock 
                ? 'bg-background-tertiary text-text-support cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-hover text-background-main'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            Adicionar
          </button>
        </div>
      </div>
    </Link>
  );
}
