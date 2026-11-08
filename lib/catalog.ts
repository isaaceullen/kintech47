import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Product, Category } from '@/types/database';

// Deduplicate queries shared by metadata and page rendering within each request.
export const getCatalogProduct = cache(async (sku: string): Promise<Product | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').select('*')
    .eq('sku', sku).or('is_active.eq.true,is_active.is.null').maybeSingle();
  if (error) throw error;
  return data;
});

export const getCatalog = cache(async () => {
  const supabase = await createClient();
  const [products, categories, settings] = await Promise.all([
    supabase.from('products').select('*').or('is_active.eq.true,is_active.is.null').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
    supabase.from('dashboard_settings').select('default_catalog_sort').eq('id', 1).maybeSingle(),
  ]);
  if (products.error) throw products.error;
  if (categories.error) throw categories.error;
  return { products: (products.data || []) as Product[], categories: (categories.data || []) as Category[], defaultSort: settings.data?.default_catalog_sort || 'newest' };
});
