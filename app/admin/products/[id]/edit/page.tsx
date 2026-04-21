import ProductForm from '@/components/admin/ProductForm';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProductStatusToggle from '@/components/admin/ProductStatusToggle';

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-text-main">Editar Produto</h1>
        <ProductStatusToggle product={product} />
      </div>
      <ProductForm initialData={product} categories={categories} />
    </div>
  );
}

