import Navbar from '@/components/Navbar';
import ProductList from '@/components/ProductList';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let defaultSort = 'newest';

  try {
    const supabase = await createClient();
    const { data: settings } = await supabase
      .from('dashboard_settings')
      .select('default_catalog_sort')
      .eq('id', 1)
      .single();

    if (settings && settings.default_catalog_sort) {
      defaultSort = settings.default_catalog_sort;
    }
  } catch (error) {
    console.error('Error fetching default sort:', error);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-[1400px] mx-auto px-2 sm:px-4 lg:px-6 py-6 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-main mb-2">Catálogo de Produtos</h1>
          <p className="text-text-support">Melhores preços em Joinville.</p>
        </div>
        <ProductList initialSort={defaultSort} />
      </main>
    </div>
  );
}
