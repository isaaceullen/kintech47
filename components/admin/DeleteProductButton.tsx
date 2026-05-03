'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface DeleteProductButtonProps {
  productId: string;
  imageUrls: string[];
}

export default function DeleteProductButton({ productId, imageUrls, triggerMode = 'icon', onOpenModal, onCloseModal, onSuccess }: DeleteProductButtonProps & { triggerMode?: 'icon' | 'menuItem', onOpenModal?: () => void, onCloseModal?: () => void, onSuccess?: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();

      // 1. Delete images from storage
      if (imageUrls && imageUrls.length > 0) {
        const pathsToDelete = imageUrls
          .filter(url => url && url.includes('/product-images/'))
          .map(url => {
            // Extract the file path from the public URL
            const parts = url.split('/product-images/');
            return parts.length > 1 ? parts[1] : null;
          })
          .filter(Boolean) as string[];

        if (pathsToDelete.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('product-images')
            .remove(pathsToDelete);
            
          if (storageError) {
            console.error('Error deleting images:', storageError);
            // Continue with product deletion even if image deletion fails
          }
        }
      }

      // 2. Delete product from database
      const { error: dbError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (dbError) throw dbError;

      toast.success('Produto excluído com sucesso!');
      setShowConfirm(false);
      onCloseModal?.();
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(`Erro ao excluir produto: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {triggerMode === 'icon' ? (
        <button 
          onClick={(e) => { e.stopPropagation(); setShowConfirm(true); onOpenModal?.(); }}
          className="p-2 text-text-support hover:text-danger transition-colors"
          title="Excluir produto"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ) : (
        <button 
          onClick={(e) => { e.stopPropagation(); setShowConfirm(true); onOpenModal?.(); }}
          className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-background-tertiary transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Excluir
        </button>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-background-secondary border border-background-tertiary rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-text-main mb-2">Confirmar Exclusão</h3>
            <p className="text-text-support mb-6">
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita e todas as imagens associadas serão apagadas do servidor.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setShowConfirm(false); onCloseModal?.(); }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-text-main hover:bg-background-tertiary transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-danger hover:bg-red-600 text-white font-medium transition-colors flex items-center gap-2"
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Excluir Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
