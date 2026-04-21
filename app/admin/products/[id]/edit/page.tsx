import ProductForm from '@/components/admin/ProductForm';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  const { data: categoriesData } = await supabase.from('categories').select('*').order('name');
  const categories = categoriesData || [];

  if (error || !product) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-8">Editar Produto</h1>
      <ProductForm initialData={product} categories={categories} />
    </div>
  );
}
