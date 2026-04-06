import Link from 'next/link';
import { Plus, Edit, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import DeleteProductButton from '@/components/admin/DeleteProductButton';
import MarkAsSoldButton from '@/components/admin/MarkAsSoldButton';

export const dynamic = 'force-dynamic';

export default async function AdminProducts() {
  let productList = [];

  try {
    const supabase = await createClient();
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    }
    
    productList = products || [];
  } catch (err) {
    console.error('Supabase fetch error:', err);
    // Fallback to mock data if Supabase fails
    const { getProducts } = await import('@/lib/api');
    productList = await getProducts();
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getImageUrl = (product: any) => {
    if (Array.isArray(product.image_urls) && product.image_urls.length > 0 && typeof product.image_urls[0] === 'string' && product.image_urls[0].startsWith('http')) {
      return product.image_urls[0];
    }
    return 'https://via.placeholder.com/400';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-text-main">Gestão de Produtos</h1>
        <Link href="/admin/products/new" className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-background-main font-medium py-2 px-4 rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          Novo Produto
        </Link>
      </div>

      <div className="bg-background-secondary rounded-xl border border-background-tertiary overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-background-tertiary bg-background-main/50">
                <th className="p-4 text-sm font-medium text-text-support">Produto</th>
                <th className="p-4 text-sm font-medium text-text-support">SKU</th>
                <th className="p-4 text-sm font-medium text-text-support">Estoque</th>
                <th className="p-4 text-sm font-medium text-text-support">Custo</th>
                <th className="p-4 text-sm font-medium text-text-support">Venda (PIX)</th>
                <th className="p-4 text-sm font-medium text-text-support">Lucro Real</th>
                <th className="p-4 text-sm font-medium text-text-support">Margem</th>
                <th className="p-4 text-sm font-medium text-text-support text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {productList.map((product) => {
                const profit = product.pix_price - product.cost_price;
                const margin = product.cost_price > 0 ? (profit / product.cost_price) * 100 : 0;
                
                return (
                  <tr key={product.id} className="border-b border-background-tertiary hover:bg-background-main/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded overflow-hidden bg-background-tertiary">
                          <Image src={getImageUrl(product)} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <p className="font-medium text-text-main line-clamp-1">{product.name}</p>
                          <p className="text-xs text-text-support">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-text-main">{product.sku}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${product.is_out_of_stock ? 'text-danger' : 'text-success'}`}>
                          {product.is_out_of_stock ? 'Esgotado' : 'Em Estoque'}
                        </span>
                        {product.is_out_of_stock && (
                          <span title="Esgotado">
                            <AlertCircle className="w-4 h-4 text-danger" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-text-support">{formatCurrency(product.cost_price)}</td>
                    <td className="p-4 text-sm font-medium text-success">{formatCurrency(product.pix_price)}</td>
                    <td className="p-4 text-sm text-accent">{formatCurrency(profit)}</td>
                    <td className="p-4 text-sm text-accent">{margin.toFixed(1)}%</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <MarkAsSoldButton product={product} />
                        <Link href={`/admin/products/${product.id}/edit`} className="p-2 text-text-support hover:text-primary transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteProductButton productId={product.id} imageUrls={product.image_urls || []} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {productList.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-support">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
