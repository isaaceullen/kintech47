'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface StockToggleProps {
  productId: string;
  initialIsOutOfStock: boolean;
  onUpdate: (newStatus: boolean) => void;
}

export default function StockToggle({ productId, initialIsOutOfStock, onUpdate }: StockToggleProps) {
  const [isOutOfStock, setIsOutOfStock] = useState(initialIsOutOfStock);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isLoading) return;
    
    const newStatus = !isOutOfStock;
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('products')
        .update({ is_out_of_stock: newStatus })
        .eq('id', productId);

      if (error) throw error;
      
      setIsOutOfStock(newStatus);
      onUpdate(newStatus);
      toast.success('Status de estoque atualizado!');
    } catch (error) {
      console.error('Error updating stock status:', error);
      toast.error('Erro ao atualizar estoque.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label className={`relative inline-flex items-center ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
        <input 
          type="checkbox" 
          className="sr-only peer"
          checked={isOutOfStock}
          onChange={handleToggle}
          disabled={isLoading}
        />
        <div className="w-11 h-6 bg-success peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-danger"></div>
      </label>
      <span className={`text-sm font-medium ${isOutOfStock ? 'text-danger' : 'text-success'}`}>
        {isOutOfStock ? 'Esgotado' : 'Em Estoque'}
      </span>
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary ml-1"></div>
      )}
    </div>
  );
}
