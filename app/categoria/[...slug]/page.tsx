import { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog';
import { categoryPath, categoryLabel } from '@/lib/categories';
import Navbar from '@/components/Navbar';
import ProductList from '@/components/ProductList';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { products, categories, defaultSort } = await getCatalog();
  const targetSlug = slug[slug.length - 1];
  const category = categories.find(c => categoryPath(c, categories) === `/categoria/${slug.join('/')}`);

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
  const { products, categories, defaultSort } = await getCatalog();
  const targetSlug = slug[slug.length - 1];
  const category = categories.find(c => categoryPath(c, categories) === `/categoria/${slug.join('/')}`);

  if (!category) {
    notFound();
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
        <ProductList initialProducts={products} initialCategories={categories} initialCategorySlug={targetSlug} initialSort={defaultSort} />
      </main>
    </>
  );
}
