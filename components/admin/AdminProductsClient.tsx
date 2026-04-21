'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, ArrowUpDown, ChevronUp, ChevronDown, MoreVertical, Power, PowerOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import DeleteProductButton from '@/components/admin/DeleteProductButton';
import MarkAsSoldButton from '@/components/admin/MarkAsSoldButton';
import StockToggle from '@/components/admin/StockToggle';
import { Product } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { trackEvent } from '@/components/GoogleAnalytics';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

type AdminProductsClientProps = {
  initialProducts: Product[];
  initialDefaultSort: string;
};

export default function AdminProductsClient({ initialProducts, initialDefaultSort }: AdminProductsClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [defaultSort, setDefaultSort] = useState(initialDefaultSort);
  const [isUpdatingSort, setIsUpdatingSort] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

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
      
      // Handle boolean for promo
      if (key === 'is_promo_active') {
        aValue = a.is_promo_active ? 1 : 0;
        bValue = b.is_promo_active ? 1 : 0;
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

  const handleStockUpdate = (productId: string, newStatus: boolean) => {
    setProducts(products.map(p => p.id === productId ? { ...p, is_out_of_stock: newStatus } : p));
  };

  const toggleActiveStatus = async (product: Product) => {
    setIsUpdatingStatus(product.id);
    const newStatus = !product.is_active;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('products')
        .update({ is_active: newStatus })
        .eq('id', product.id);

      if (error) throw error;
      
      setProducts(products.map(p => p.id === product.id ? { ...p, is_active: newStatus } : p));
      toast.success(newStatus ? 'Produto ativado!' : 'Produto desativado!');
      trackEvent('toggle_product_status', { 
        product_id: product.id, 
        product_name: product.name, 
        new_status: newStatus ? 'active' : 'inactive' 
      });
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Erro ao alterar status do produto.');
    } finally {
      setIsUpdatingStatus(null);
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
              <option value="promo_first">Promoções Primeiro</option>
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
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-background-tertiary bg-background-main/50">
                <th 
                  className="p-4 text-sm font-medium text-text-support cursor-pointer hover:text-text-main transition-colors"
                  onClick={() => handleSort('name')}
                >
                  Produto {getSortIcon('name')}
                </th>
                <th className="p-4 text-sm font-medium text-text-support">SKU</th>
                <th 
                  className="p-4 text-sm font-medium text-text-support cursor-pointer hover:text-text-main transition-colors"
                  onClick={() => handleSort('is_promo_active')}
                >
                  Promoção {getSortIcon('is_promo_active')}
                </th>
                <th className="p-4 text-sm font-medium text-text-support">Estoque</th>
                <th className="p-4 text-sm font-medium text-text-support">Custo</th>
                <th 
                  className="p-4 text-sm font-medium text-text-support cursor-pointer hover:text-text-main transition-colors"
                  onClick={() => handleSort('pix_price')}
                >
                  Venda (PIX) {getSortIcon('pix_price')}
                </th>
                <th className="p-4 text-sm font-medium text-text-support text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                let currentPixPrice = product.pix_price;
                if (product.is_promo_active) {
                  if (product.discount_type === 'percentage') {
                    currentPixPrice = product.pix_price - (product.pix_price * ((product.discount_amount || 0) / 100));
                  } else {
                    currentPixPrice = product.pix_price - (product.discount_amount || 0);
                  }
                  currentPixPrice = Math.max(0, currentPixPrice);
                }
                
                const isActive = product.is_active !== false; // Default to true if undefined
                
                return (
                  <tr 
                    key={product.id} 
                    className={`border-b border-background-tertiary hover:bg-background-main/50 transition-colors ${!isActive ? 'opacity-50 grayscale-[0.5] bg-black/20' : ''}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded overflow-hidden bg-background-tertiary flex-shrink-0">
                          <Image src={getImageUrl(product)} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-text-main truncate">{product.name}</p>
                            {!isActive && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-background-tertiary text-text-support uppercase font-bold">Inativo</span>
                            )}
                          </div>
                          <p className="text-xs text-text-support truncate">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-text-main">{product.sku}</td>
                    <td className="p-4">
                      {product.is_promo_active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-primary/20 text-primary border border-primary/30">
                          ATIVO
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-background-tertiary" title="Sem promoção">
                          <span className="w-2 h-2 rounded-full bg-text-support/50"></span>
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <StockToggle 
                        productId={product.id} 
                        initialIsOutOfStock={product.is_out_of_stock} 
                        onUpdate={(newStatus) => handleStockUpdate(product.id, newStatus)}
                      />
                    </td>
                    <td className="p-4 text-sm text-text-support">{formatCurrency(product.cost_price)}</td>
                    <td className="p-4 text-sm font-medium text-success">
                      {product.is_promo_active ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-text-support line-through">{formatCurrency(product.pix_price)}</span>
                          <span className="text-primary">{formatCurrency(currentPixPrice)}</span>
                        </div>
                      ) : (
                        formatCurrency(product.pix_price)
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 text-text-support hover:text-text-main transition-colors rounded-lg hover:bg-background-tertiary">
                          <MoreVertical className="w-5 h-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-background-secondary border-background-tertiary text-text-main">
                          <DropdownMenuItem 
                            onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                            Editar Produto
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator className="bg-background-tertiary" />
                          
                          <DropdownMenuItem 
                            onClick={() => toggleActiveStatus(product)}
                            disabled={isUpdatingStatus === product.id}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            {isActive ? (
                              <>
                                <PowerOff className="w-4 h-4 text-danger" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <Power className="w-4 h-4 text-success" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuItem className="focus:bg-transparent p-0">
                            <div className="w-full">
                               <MarkAsSoldButton product={product} variant="menuItem" />
                            </div>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-background-tertiary" />
                          
                          <DropdownMenuItem className="focus:bg-transparent p-0">
                            <div className="w-full">
                              <DeleteProductButton productId={product.id} imageUrls={product.image_urls || []} variant="menuItem" />
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

