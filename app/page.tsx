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
        <div className="catalog-hero mb-10 rounded-2xl border border-primary/20 px-6 py-8 sm:px-10 sm:py-12">
          <p className="text-xs uppercase tracking-[0.25em] text-accent mb-4">Kintech47 · Joinville</p>
          <h1 className="text-3xl font-bold text-text-main mb-2">Sua próxima fragrância está aqui.</h1>
          <p className="text-text-support">Explore perfumes, body splashes e cuidados para o corpo. Escolha o seu favorito e aproveite os preços no PIX.</p>
        </div>
        <ProductList initialProducts={products} initialCategories={categories} initialSort={defaultSort} />
      </main>
    </div>
  );
}
