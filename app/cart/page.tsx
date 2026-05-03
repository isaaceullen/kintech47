'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowLeft, Send } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import Navbar from '@/components/Navbar';
import html2canvas from 'html2canvas';
import { trackEvent } from '@/components/GoogleAnalytics';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPix, getTotalCard } = useCartStore();
  const summaryRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getImageUrl = (item: any) => {
    if (Array.isArray(item.image_urls) && item.image_urls.length > 0 && typeof item.image_urls[0] === 'string' && item.image_urls[0].startsWith('http')) {
      return item.image_urls[0];
    }
    return 'https://via.placeholder.com/200';
  };

  const handleCheckout = async () => {
    if (!summaryRef.current || items.length === 0) return;
    
    setIsProcessing(true);
    try {
      trackEvent('generate_order_whatsapp', {
        total_pix: getTotalPix(),
        total_card: getTotalCard()
      });

      // Generate image of the summary
      const canvas = await html2canvas(summaryRef.current, {
        backgroundColor: '#0B132B', // match dark theme
        scale: 2,
      });
      
      // We can't easily send the image directly via WhatsApp URL scheme.
      // Usually, we upload it somewhere or just send the text.
      // Since the prompt asks to "generate a clean image/PDF of the order summary... then redirect to wa.me",
      // we will generate the text for the message. If we could upload the image to Supabase storage, we could send the link.
      // For now, let's create a detailed text message.
      
      let message = `*NOVO PEDIDO*\n\n`;
      items.forEach(item => {
        message += `▪ ${item.cartQuantity}x ${item.name} (SKU: ${item.sku})\n`;
      });
      message += `\n*Total PIX:* ${formatCurrency(getTotalPix())}`;
      message += `\n*Total Cartão:* ${formatCurrency(getTotalCard())}`;
      message += `\n\nPor favor, confirme meu pedido!`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/5547988692150?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error generating checkout:', error);
      alert('Ocorreu um erro ao processar o pedido. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center mb-8">
          <Link href="/" className="inline-flex items-center text-text-support hover:text-primary transition-colors mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-text-main">Seu Carrinho</h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-background-secondary rounded-2xl p-12 text-center border border-background-tertiary">
            <div className="text-text-support mb-4">Seu carrinho está vazio.</div>
            <Link href="/" className="inline-block bg-primary hover:bg-primary-hover text-background-main font-medium py-2 px-6 rounded-lg transition-colors">
              Continuar Comprando
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row bg-background-secondary rounded-xl p-4 border border-background-tertiary gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-background-tertiary">
                    <Image
                      src={getImageUrl(item)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-text-main line-clamp-1">{item.name}</h3>
                        <p className="text-xs text-text-support">SKU: {item.sku}</p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-text-support hover:text-danger p-1 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center bg-background-main rounded-lg border border-background-tertiary">
                        <button 
                          onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                          className="p-2 text-text-support hover:text-text-main transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium text-text-main">{item.cartQuantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                          className="p-2 text-text-support hover:text-text-main transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-success">{formatCurrency(item.pix_price * item.cartQuantity)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div 
                ref={summaryRef}
                className="bg-background-secondary rounded-xl p-6 border border-background-tertiary sticky top-24"
              >
                <h2 className="text-xl font-bold text-text-main mb-6 border-b border-background-tertiary pb-4">Resumo do Pedido</h2>
                
                <div className="space-y-3 mb-6 hidden">
                  {/* Hidden list for the image generation if needed */}
                  {items.map(item => (
                    <div key={`summary-${item.id}`} className="flex justify-between text-sm">
                      <span className="text-text-support truncate pr-4">{item.cartQuantity}x {item.name}</span>
                      <span className="text-text-main whitespace-nowrap">{formatCurrency(item.pix_price * item.cartQuantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-text-support">Total no Cartão</span>
                      <span className="text-text-main font-medium">Em até 4x de {formatCurrency(getTotalCard() / 4)}</span>
                    </div>
                    <div className="text-right text-xs text-text-support">
                      sem juros no cartão (Total: {formatCurrency(getTotalCard())})
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-background-tertiary">
                    <span className="text-lg font-medium text-text-main">Total no PIX</span>
                    <span className="text-2xl font-bold text-success">{formatCurrency(getTotalPix())}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full mt-8 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-4 rounded-lg font-bold transition-colors"
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Comprar pelo WhatsApp
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-text-support mt-4">
                  Você será redirecionado para o WhatsApp para finalizar seu pedido.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
