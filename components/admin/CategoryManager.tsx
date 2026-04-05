'use client';

import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
}

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCategory, setNewCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setIsAdding(true);
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newCategory.trim() }])
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, data]);
      setNewCategory('');
      toast.success('Categoria adicionada com sucesso!');
      router.refresh();
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error(`Erro ao adicionar categoria: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;

    setDeletingId(id);
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(categories.filter(c => c.id !== id));
      toast.success('Categoria excluída com sucesso!');
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(`Erro ao excluir categoria: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-background-secondary rounded-xl border border-background-tertiary p-6 max-w-2xl">
      <form onSubmit={handleAdd} className="flex gap-4 mb-8">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nome da nova categoria"
          className="flex-grow px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
          required
        />
        <button
          type="submit"
          disabled={isAdding}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-background-main font-medium py-2 px-6 rounded-lg transition-colors"
        >
          {isAdding ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-background-main"></div>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Adicionar
            </>
          )}
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-background-tertiary">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-background-tertiary bg-background-main/50">
              <th className="p-4 text-sm font-medium text-text-support">Nome da Categoria</th>
              <th className="p-4 text-sm font-medium text-text-support text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-background-tertiary hover:bg-background-main/50 transition-colors">
                <td className="p-4 text-text-main font-medium">{category.name}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={deletingId === category.id}
                    className="p-2 text-text-support hover:text-danger transition-colors"
                    title="Excluir categoria"
                  >
                    {deletingId === category.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-danger"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={2} className="p-8 text-center text-text-support">
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
