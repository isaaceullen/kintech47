import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getProductBySku, getProducts } from '@/lib/api';
import Navbar from '@/components/Navbar';
import AddToCartButton from '@/components/AddToCartButton';
import ProductCard from '@/components/ProductCard';

export default async function ProductPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const product = await getProductBySku(sku);

  if (!product) {
    notFound();
  }

  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/" className="inline-flex items-center text-text-support hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para o catálogo
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* Image Gallery (Simplified for now) */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-background-secondary border border-background-tertiary">
            <Image
              src={product.image_url || `https://picsum.photos/seed/${product.sku}/800/800`}
              alt={product.name}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
              priority
            />
            {product.is_out_of_stock && (
              <div className="absolute top-4 right-4 z-10 bg-danger text-white font-bold px-3 py-1.5 rounded-md">
                Esgotado
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="text-sm text-accent font-medium mb-2 uppercase tracking-wider">{product.category}</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-main mb-4">{product.name}</h1>
            <p className="text-sm text-text-support mb-6">SKU: {product.sku}</p>
            
            <div className="bg-background-secondary p-6 rounded-xl border border-background-tertiary mb-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-success">{formatCurrency(product.pix_price)}</span>
                  <span className="text-text-support">no PIX</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl text-text-main">{formatCurrency(product.card_price)}</span>
                  <span className="text-text-support">no cartão em até 12x</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-text-main mb-3">Descrição</h3>
              <div className="text-text-reading leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-4">
              <AddToCartButton product={product} />
              
              {product.external_link && (
                <a 
                  href={product.external_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium border border-background-tertiary text-text-main hover:bg-background-tertiary transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  Ver Vídeo / Mais Detalhes
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-text-main mb-6 border-b border-background-tertiary pb-4">Produtos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
