import ProductForm from '@/components/admin/ProductForm';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  let categories = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('categories').select('*').order('name');
    categories = data || [];
  } catch (e) {
    console.error(e);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-8">Novo Produto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
