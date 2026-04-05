import { createClient } from '@/lib/supabase/server';
import CategoryManager from '@/components/admin/CategoryManager';

export const dynamic = 'force-dynamic';

export default async function AdminCategories() {
  let categories = [];

  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
    }
    
    categories = data || [];
  } catch (err) {
    console.error('Supabase fetch error:', err);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-8">Gestão de Categorias</h1>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
