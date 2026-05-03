import { Metadata } from 'next';
import { getCategories } from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProductList from '@/components/ProductList';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const targetSlug = slug[slug.length - 1];
  const category = categories.find(c => c.slug === targetSlug);

  if (!category) {
    return {
      title: 'Categoria Não Encontrada | Kintech47',
    };
  }

  return {
    title: `${category.name} | Kintech47`,
    description: `Confira nossos produtos na categoria ${category.name}.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const targetSlug = slug[slug.length - 1];
  const category = categories.find(c => c.slug === targetSlug);

  if (!category) {
    notFound();
  }

  let defaultSort = 'newest';
  
  try {
    const { createClient } = await import('@/lib/supabase/server');
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
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-[1400px]">
        <div className="mb-8 border-b border-background-tertiary pb-4">
          <h1 className="text-3xl font-bold text-text-main">
            Produtos em: <span className="text-primary">{category.name}</span>
          </h1>
        </div>
        <ProductList initialCategorySlug={targetSlug} initialSort={defaultSort} />
      </main>
    </>
  );
}
