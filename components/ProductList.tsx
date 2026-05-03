'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Product, Category } from '@/types/database';
import { getProducts, getProductsByCategory, getCategories } from '@/lib/api';
import ProductCard from './ProductCard';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

interface ProductListProps {
  initialSort?: string;
  initialCategorySlug?: string;
}

export default function ProductList({ initialSort = 'newest', initialCategorySlug }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states (Global for filtering logic)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>(initialSort);
  
  // Local states for inputs (to prevent focus loss)
  const [localMinPrice, setLocalMinPrice] = useState<string>('');
  const [localMaxPrice, setLocalMaxPrice] = useState<string>('');
  
  // Mobile menu state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const categoriesData = await getCategories();
      setCategories(categoriesData);

      let productsData = [];
      if (initialCategorySlug) {
        productsData = await getProductsByCategory(initialCategorySlug);
        const cat = categoriesData.find(c => c.slug === initialCategorySlug);
        if (cat) setSelectedCategory(cat.name);
      } else {
        productsData = await getProducts();
      }
      
      setProducts(productsData);
      setLoading(false);
    }
    loadData();
  }, [initialCategorySlug]);

  // Debounce for minPrice
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinPrice(localMinPrice);
    }, 500);
    return () => clearTimeout(timer);
  }, [localMinPrice]);

  // Debounce for maxPrice
  useEffect(() => {
    const timer = setTimeout(() => {
      setMaxPrice(localMaxPrice);
    }, 500);
    return () => clearTimeout(timer);
  }, [localMaxPrice]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy(initialSort);
    // If we're on a category page, reset URL
    if (window.location.pathname.startsWith('/categoria/')) {
      window.location.href = '/';
    }
  };

  // Apply filters
  let filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCategory = false;
    if (selectedCategory === 'all') {
      matchesCategory = true;
    } else {
      matchesCategory = p.category === selectedCategory;
      if (!matchesCategory) {
        const cat = categories.find(c => c.name === selectedCategory);
        if (cat) {
          const subcatsNames = categories.filter(c => c.parent_id === cat.id).map(c => c.name);
          matchesCategory = subcatsNames.includes(p.category);
        }
      }
    }
    
    const price = p.pix_price;
    const matchesMinPrice = minPrice === '' || price >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === '' || price <= parseFloat(maxPrice);

    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  // Apply sorting
  filteredProducts = filteredProducts.sort((a, b) => {
    if (sortBy === 'promo_first') {
      if (a.is_promo_active && !b.is_promo_active) return -1;
      if (!a.is_promo_active && b.is_promo_active) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'az') return a.name.localeCompare(b.name);
    if (sortBy === 'za') return b.name.localeCompare(a.name);
    if (sortBy === 'lowest_price') return a.pix_price - b.pix_price;
    if (sortBy === 'highest_price') return b.pix_price - a.pix_price;
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return 0;
  });

  // Inlined filter content to prevent unmounting and focus loss
  const renderFilters = (isMobile: boolean) => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-lg font-bold text-text-main mb-4 border-b border-background-tertiary pb-2">Categorias</h3>
        <div className="space-y-2">
          <Link
            href="/"
            onClick={() => {
              if (isMobile) setIsMobileFiltersOpen(false);
            }}
            className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === 'all' ? 'bg-accent text-background-main font-bold' : 'text-text-support hover:bg-background-tertiary hover:text-text-main'}`}
          >
            Todas as Categorias
          </Link>
          {categories.filter(cat => !cat.parent_id).map(cat => (
            <div key={cat.id}>
              <Link
                href={`/categoria/${cat.slug}`}
                onClick={() => {
                  if (isMobile) setIsMobileFiltersOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat.name ? 'bg-accent text-background-main font-bold' : 'text-text-support hover:bg-background-tertiary hover:text-text-main'}`}
              >
                {cat.name}
              </Link>
              {/* Subcategories */}
              {categories.filter(subcat => subcat.parent_id === cat.id).length > 0 && (
                <div className="ml-4 pl-2 border-l border-background-tertiary space-y-1 mt-1">
                  {categories.filter(subcat => subcat.parent_id === cat.id).map(subcat => (
                    <Link
                      key={subcat.id}
                      href={`/categoria/${cat.slug}/${subcat.slug}`}
                      onClick={() => {
                        if (isMobile) setIsMobileFiltersOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedCategory === subcat.name ? 'bg-background-tertiary text-primary font-medium' : 'text-text-support hover:text-text-main hover:bg-background-main/50'}`}
                    >
                      {subcat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-lg font-bold text-text-main mb-4 border-b border-background-tertiary pb-2">Preço (PIX)</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label htmlFor={`min-price-${isMobile ? 'mobile' : 'desktop'}`} className="block text-xs text-text-support mb-1">A partir de R$</label>
            <input
              id={`min-price-${isMobile ? 'mobile' : 'desktop'}`}
              type="number"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              onBlur={() => setMinPrice(localMinPrice)}
              className="w-full px-3 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary text-sm"
              placeholder="0,00"
            />
          </div>
          <div className="flex-1">
            <label htmlFor={`max-price-${isMobile ? 'mobile' : 'desktop'}`} className="block text-xs text-text-support mb-1">Até R$</label>
            <input
              id={`max-price-${isMobile ? 'mobile' : 'desktop'}`}
              type="number"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              onBlur={() => setMaxPrice(localMaxPrice)}
              className="w-full px-3 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary text-sm"
              placeholder="999,00"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Mobile Filter Overlay */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-background-main/80 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)}></div>
          <div className="relative w-4/5 max-w-xs bg-background-secondary h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between p-4 border-b border-background-tertiary">
              <h2 className="text-xl font-bold text-text-main">Filtros</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-text-support hover:text-text-main">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
              {renderFilters(true)}
            </div>
            <div className="p-4 border-t border-background-tertiary">
              <button 
                onClick={() => { clearFilters(); setIsMobileFiltersOpen(false); }}
                className="w-full py-3 border border-background-tertiary text-text-main rounded-lg font-medium hover:bg-background-tertiary transition-colors mb-3"
              >
                Limpar Filtros
              </button>
              <button 
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 bg-accent hover:bg-accent-hover text-background-main rounded-lg font-bold transition-colors"
              >
                Ver Resultados ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <div className="sticky top-24 bg-background-secondary p-6 rounded-xl border border-background-tertiary">
          {renderFilters(false)}
          <button 
            onClick={() => clearFilters()}
            className="w-full mt-8 py-2 border border-background-tertiary text-text-main rounded-lg font-medium hover:bg-background-tertiary transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar: Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-text-support" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-background-tertiary rounded-lg leading-5 bg-background-secondary text-text-main placeholder-text-support focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-3 bg-background-secondary border border-background-tertiary rounded-lg text-text-main hover:bg-background-tertiary transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span className="sr-only">Filtros</span>
            </button>
            
            <div className="relative flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none w-full sm:w-48 pl-4 pr-10 py-3 bg-background-secondary border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors cursor-pointer"
              >
                <option value="newest">Mais Recentes</option>
                <option value="promo_first">Promoções Primeiro</option>
                <option value="az">Ordenar de A-Z</option>
                <option value="za">Ordenar de Z-A</option>
                <option value="lowest_price">Menor Preço</option>
                <option value="highest_price">Maior Preço</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-text-support">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-background-secondary rounded-xl border border-background-tertiary p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background-tertiary mb-4">
                  <Search className="w-8 h-8 text-text-support" />
                </div>
                <h3 className="text-xl font-bold text-text-main mb-2">Nenhum produto encontrado</h3>
                <p className="text-text-support mb-6">Não encontramos nenhum produto com esses filtros.</p>
                <button 
                  onClick={() => clearFilters()}
                  className="px-6 py-2 bg-accent hover:bg-accent-hover text-background-main font-bold rounded-lg transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
