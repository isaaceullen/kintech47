'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, AlertCircle, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import DeleteProductButton from '@/components/admin/DeleteProductButton';
import MarkAsSoldButton from '@/components/admin/MarkAsSoldButton';
import { Product } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

type AdminProductsClientProps = {
  initialProducts: Product[];
  initialDefaultSort: string;
};

export default function AdminProductsClient({ initialProducts, initialDefaultSort }: AdminProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [defaultSort, setDefaultSort] = useState(initialDefaultSort);
  const [isUpdatingSort, setIsUpdatingSort] = useState(false);

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

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedProducts = [...products].sort((a, b) => {
      let aValue: any = a[key as keyof Product];
      let bValue: any = b[key as keyof Product];

      // Handle calculated fields
      if (key === 'profit') {
        aValue = a.pix_price - a.cost_price;
        bValue = b.pix_price - b.cost_price;
      }

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setProducts(sortedProducts);
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 ml-1 inline-block opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1 inline-block" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1 inline-block" />
    );
  };

  const handleDefaultSortChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    setDefaultSort(newSort);
    setIsUpdatingSort(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('dashboard_settings')
        .upsert({ id: 1, default_catalog_sort: newSort });

      if (error) throw error;
      toast.success('Ordem padrão do catálogo atualizada!');
    } catch (error) {
      console.error('Error updating default sort:', error);
      toast.error('Erro ao atualizar ordem padrão.');
      // Revert on error
      setDefaultSort(initialDefaultSort);
    } finally {
      setIsUpdatingSort(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-text-main">Gestão de Produtos</h1>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-background-secondary border border-background-tertiary rounded-lg px-3 py-2 w-full sm:w-auto">
            <label htmlFor="defaultSort" className="text-sm text-text-support whitespace-nowrap">Ordem Padrão:</label>
            <select
              id="defaultSort"
              value={defaultSort}
              onChange={handleDefaultSortChange}
              disabled={isUpdatingSort}
              className="bg-transparent text-text-main text-sm focus:outline-none cursor-pointer w-full"
            >
              <option value="newest">Mais Recentes</option>
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
              <option value="lowest_price">Menor Preço</option>
              <option value="highest_price">Maior Preço</option>
            </select>
          </div>

          <Link href="/admin/products/new" className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-background-main font-medium py-2 px-4 rounded-lg transition-colors w-full sm:w-auto">
            <Plus className="w-5 h-5" />
            Novo Produto
          </Link>
        </div>
      </div>

      <div className="bg-background-secondary rounded-xl border border-background-tertiary overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-background-tertiary bg-background-main/50">
                <th 
                  className="p-4 text-sm font-medium text-text-support cursor-pointer hover:text-text-main transition-colors"
                  onClick={() => handleSort('name')}
                >
                  Produto {getSortIcon('name')}
                </th>
                <th className="p-4 text-sm font-medium text-text-support">SKU</th>
                <th className="p-4 text-sm font-medium text-text-support">Estoque</th>
                <th className="p-4 text-sm font-medium text-text-support">Custo</th>
                <th 
                  className="p-4 text-sm font-medium text-text-support cursor-pointer hover:text-text-main transition-colors"
                  onClick={() => handleSort('pix_price')}
                >
                  Venda (PIX) {getSortIcon('pix_price')}
                </th>
                <th 
                  className="p-4 text-sm font-medium text-text-support cursor-pointer hover:text-text-main transition-colors"
                  onClick={() => handleSort('profit')}
                >
                  Lucro Real {getSortIcon('profit')}
                </th>
                <th className="p-4 text-sm font-medium text-text-support">Margem</th>
                <th className="p-4 text-sm font-medium text-text-support text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
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
              {products.length === 0 && (
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
