'use client';

import { useState } from 'react';
import { Power, PowerOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Product } from '@/types/database';

type ProductStatusToggleProps = {
  product: Product;
};

export default function ProductStatusToggle({ product }: ProductStatusToggleProps) {
  const [isActive, setIsActive] = useState(product.is_active !== false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleStatus = async () => {
    setIsUpdating(true);
    const newStatus = !isActive;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('products')
        .update({ is_active: newStatus })
        .eq('id', product.id);

      if (error) throw error;
      
      setIsActive(newStatus);
      toast.success(newStatus ? 'Produto ativado!' : 'Produto desativado!');
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Erro ao alterar status do produto.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={toggleStatus}
      disabled={isUpdating}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border ${
        isActive 
          ? 'bg-background-main border-danger text-danger hover:bg-danger/10' 
          : 'bg-primary border-primary text-background-main hover:bg-primary-hover shadow-lg shadow-primary/20'
      }`}
    >
      {isUpdating ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isActive ? (
        <PowerOff className="w-5 h-5" />
      ) : (
        <Power className="w-5 h-5" />
      )}
      {isActive ? 'Desativar Produto' : 'Ativar Produto'}
    </button>
  );
}
