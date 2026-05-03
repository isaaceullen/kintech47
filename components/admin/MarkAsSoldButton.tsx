'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Product } from '@/types/database';

type MarkAsSoldButtonProps = {
  product: Product;
};

export default function MarkAsSoldButton({ product, triggerMode = 'icon', onOpenModal, onCloseModal, onSuccess }: MarkAsSoldButtonProps & { triggerMode?: 'icon' | 'menuItem', onOpenModal?: () => void, onCloseModal?: () => void, onSuccess?: () => void }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Cartão'>('PIX');
  const [salePrice, setSalePrice] = useState<string>(product.pix_price.toString());
  const [costPrice, setCostPrice] = useState<string>(product.cost_price.toString());

  const handlePaymentMethodChange = (method: 'PIX' | 'Cartão') => {
    setPaymentMethod(method);
    setSalePrice(method === 'PIX' ? product.pix_price.toString() : product.card_price.toString());
  };

  const handleConfirm = async () => {
    const finalPrice = parseFloat(salePrice);
    const finalCost = parseFloat(costPrice);
    if (isNaN(finalPrice) || finalPrice < 0) {
      toast.error('Valor de venda inválido');
      return;
    }
    if (isNaN(finalCost) || finalCost < 0) {
      toast.error('Custo do produto inválido');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const profit = finalPrice - finalCost;

      // 1. Register Sale
      const { error: saleError } = await supabase
        .from('sales')
        .insert([{
          product_id: product.id,
          product_name: product.name,
          cost_price: finalCost,
          sale_price: finalPrice,
          payment_method: paymentMethod,
          profit: profit
        }]);

      if (saleError) throw saleError;

      // 2. Update Product to out_of_stock
      const { error: productError } = await supabase
        .from('products')
        .update({ is_out_of_stock: true })
        .eq('id', product.id);

      if (productError) throw productError;

      toast.success('Venda registrada com sucesso!');
      setIsOpen(false);
      onCloseModal?.();
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error recording sale:', error);
      toast.error('Erro ao registrar venda: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {triggerMode === 'icon' ? (
        <button 
          onClick={(e) => { e.stopPropagation(); setIsOpen(true); onOpenModal?.(); }}
          className="p-2 text-text-support hover:text-success transition-colors"
          title="Marcar como Vendido"
        >
          <DollarSign className="w-4 h-4" />
        </button>
      ) : (
        <button 
          onClick={(e) => { e.stopPropagation(); setIsOpen(true); onOpenModal?.(); }}
          className="w-full text-left px-4 py-2 text-sm text-text-main hover:bg-background-tertiary transition-colors flex items-center gap-2"
        >
          <DollarSign className="w-4 h-4" />
          Vendido
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
          <div className="bg-background-secondary rounded-xl border border-background-tertiary w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-text-main mb-4">Registrar Venda</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-support mb-1">Produto</label>
                  <input 
                    type="text" 
                    value={product.name} 
                    readOnly 
                    className="w-full px-3 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-support cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-support mb-1">Custo do Produto (R$)</label>
                  <input 
                    type="number" 
                    value={costPrice} 
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-support mb-1">Forma de Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => handlePaymentMethodChange(e.target.value as 'PIX' | 'Cartão')}
                    className="w-full px-3 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Cartão">Cartão</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-support mb-1">Valor Final da Venda (R$)</label>
                  <input 
                    type="number" 
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full px-3 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-background-tertiary flex justify-end gap-3 bg-background-main/50">
              <button 
                onClick={() => { setIsOpen(false); onCloseModal?.(); }}
                disabled={isSubmitting}
                className="px-4 py-2 text-text-support hover:text-text-main font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-success hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                Confirmar Venda
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
