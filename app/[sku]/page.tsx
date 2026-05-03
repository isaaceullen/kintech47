import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import AddToCartButton from '@/components/AddToCartButton';
import ProductCard from '@/components/ProductCard';
import ProductGallery from '@/components/ProductGallery';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ sku: string }> }): Promise<Metadata> {
  const { sku } = await params;
  
  try {
    const supabase = await createClient();
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .single();

    if (!product) {
      return {
        title: 'Produto não encontrado',
      };
    }

    const title = product.seo_title || product.name;
    const description = product.seo_description || product.description.substring(0, 160);

    return {
      title: `${title} | Kintech47`,
      description: description,
      openGraph: {
        title: title,
        description: description,
        images: product.image_urls?.[0] ? [product.image_urls[0]] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Produto',
    };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  let product = null;
  let allProducts = [];
  let productError = null;

  try {
    const supabase = await createClient();
    
    const { data: pData, error: pError } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .single();
      
    product = pData;
    productError = pError;

    if (!pError && pData) {
      const { data: aData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      allProducts = aData || [];
    }
  } catch (err) {
    console.error('Supabase fetch error:', err);
    // Fallback to mock data if Supabase fails
    const { getProductBySku, getProducts } = await import('@/lib/api');
    product = await getProductBySku(sku);
    allProducts = await getProducts();
  }

  if (productError || !product) {
    notFound();
  }

  const relatedProducts = (allProducts || [])
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const finalPrice = product.is_promo_active 
    ? Math.max(0, product.discount_type === 'percentage' 
        ? product.pix_price - (product.pix_price * ((product.discount_amount || 0) / 100))
        : product.pix_price - (product.discount_amount || 0))
    : product.pix_price;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image_urls?.[0] || '',
    description: product.description,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      url: `https://kintech47.com.br/${product.sku}`, // Replace with actual domain
      priceCurrency: 'BRL',
      price: finalPrice,
      availability: product.is_out_of_stock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/" className="inline-flex items-center text-text-support hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para o catálogo
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          <ProductGallery 
            images={product.image_urls || []} 
            videoUrls={product.video_urls || []}
            sku={product.sku} 
            name={product.name} 
            isOutOfStock={product.is_out_of_stock}
            isPromoActive={product.is_promo_active}
            discountType={product.discount_type}
            discountAmount={product.discount_amount}
            pixPrice={product.pix_price}
          />

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="text-sm text-accent font-medium mb-2 uppercase tracking-wider">{product.category}</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-main mb-4">{product.name}</h1>
            <p className="text-sm text-text-support mb-6">SKU: {product.sku}</p>
            
            <div className="bg-background-secondary p-6 rounded-xl border border-background-tertiary mb-8">
              <div className="flex flex-col gap-2">
                {product.is_promo_active ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg text-text-support line-through">{formatCurrency(product.pix_price)}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-primary">
                        {formatCurrency(
                          Math.max(0, product.discount_type === 'percentage' 
                            ? product.pix_price - (product.pix_price * ((product.discount_amount || 0) / 100))
                            : product.pix_price - (product.discount_amount || 0))
                        )}
                      </span>
                      <span className="text-text-support">no PIX</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-xl text-text-main">
                        Em até 4x de {formatCurrency(Math.ceil(Math.max(0, product.discount_type === 'percentage' 
                            ? product.pix_price - (product.pix_price * ((product.discount_amount || 0) / 100))
                            : product.pix_price - (product.discount_amount || 0)) * 1.14) / 4)}
                      </span>
                      <span className="text-text-support">
                        sem juros no cartão (Total: {formatCurrency(Math.ceil(Math.max(0, product.discount_type === 'percentage' 
                            ? product.pix_price - (product.pix_price * ((product.discount_amount || 0) / 100))
                            : product.pix_price - (product.discount_amount || 0)) * 1.14))})
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-success">{formatCurrency(product.pix_price)}</span>
                      <span className="text-text-support">no PIX</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl text-text-main">Em até 4x de {formatCurrency(product.card_price / 4)}</span>
                      <span className="text-text-support">sem juros no cartão (Total: {formatCurrency(product.card_price)})</span>
                    </div>
                  </>
                )}
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
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-6">
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
