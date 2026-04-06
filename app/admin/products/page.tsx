import { createClient } from '@/lib/supabase/server';
import AdminProductsClient from '@/components/admin/AdminProductsClient';

export const dynamic = 'force-dynamic';

export default async function AdminProducts() {
  let productList = [];
  let defaultSort = 'newest';

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

    // Fetch default sort
    const { data: settings } = await supabase
      .from('dashboard_settings')
      .select('default_catalog_sort')
      .eq('id', 1)
      .single();

    if (settings && settings.default_catalog_sort) {
      defaultSort = settings.default_catalog_sort;
    }

  } catch (err) {
    console.error('Supabase fetch error:', err);
    // Fallback to mock data if Supabase fails
    const { getProducts } = await import('@/lib/api');
    productList = await getProducts();
  }

  return <AdminProductsClient initialProducts={productList} initialDefaultSort={defaultSort} />;
}
