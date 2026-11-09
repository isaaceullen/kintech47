import Navbar from '@/components/Navbar';
import ProductList from '@/components/ProductList';
import { getCatalog } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { products, categories, defaultSort } = await getCatalog();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <ProductList initialProducts={products} initialCategories={categories} initialSort={defaultSort} />
      </main>
    </div>
  );
}
