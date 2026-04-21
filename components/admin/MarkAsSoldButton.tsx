'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { trackEvent } from '@/components/GoogleAnalytics';
import { Product } from '@/types/database';

type MarkAsSoldButtonProps = {
  product: Product;
  variant?: 'default' | 'menuItem';
};

export default function MarkAsSoldButton({ product, variant = 'default' }: MarkAsSoldButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Cartão'>('PIX');
  const [salePrice, setSalePrice] = useState<string>(product.pix_price.toString());

  const handlePaymentMethodChange = (method: 'PIX' | 'Cartão') => {
    setPaymentMethod(method);
    setSalePrice(method === 'PIX' ? product.pix_price.toString() : product.card_price.toString());
  };

  const handleConfirm = async () => {
    const finalPrice = parseFloat(salePrice);
    if (isNaN(finalPrice) || finalPrice < 0) {
      toast.error('Valor de venda inválido');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const profit = finalPrice - product.cost_price;

      const { error } = await supabase
        .from('sales')
        .insert([{
          product_id: product.id,
          product_name: product.name,
          cost_price: product.cost_price,
          sale_price: finalPrice,
          payment_method: paymentMethod,
          profit: profit
        }]);

      if (error) throw error;

      toast.success('Venda registrada com sucesso!');
      
      trackEvent('mark_as_sold', {
        product_id: product.id,
        product_name: product.name,
        payment_method: paymentMethod,
        sale_price: finalPrice,
        profit: profit
      });

      setIsOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error('Error recording sale:', error);
      toast.error('Erro ao registrar venda: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === 'menuItem') {
    return (
      <>
        <div 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-background-tertiary transition-colors w-full rounded-sm"
        >
          <CheckCircle2 className="w-4 h-4 text-success" />
          Marcar Vendido
        </div>
        {isOpen && (
          <ModalContent />
        )}
      </>
    );
  }

  function ModalContent() {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-main/80 backdrop-blur-sm">
        <div className="bg-background-secondary rounded-xl border border-background-tertiary w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
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
                <label className="block text-sm font-medium text-text-support mb-1">Custo</label>
                <input 
                  type="text" 
                  value={`R$ ${product.cost_price.toFixed(2)}`} 
                  readOnly 
                  className="w-full px-3 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-support cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-support mb-1">Forma de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => handlePaymentMethodChange(e.target.value as 'PIX' | 'Cartão')}
                  className="w-full px-3 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
                >
                  <option value="PIX">PIX (R$ {product.pix_price})</option>
                  <option value="Cartão">Cartão (R$ {product.card_price})</option>
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
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-text-support hover:text-text-main font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-success hover:bg-success/80 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              Confirmar Venda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-text-support hover:text-success transition-colors"
        title="Marcar como Vendido"
      >
        <DollarSign className="w-4 h-4" />
      </button>

      {isOpen && (
        <ModalContent />
      )}
    </>
  );
}

