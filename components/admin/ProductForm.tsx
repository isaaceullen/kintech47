'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wand2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [isGeneratingSku, setIsGeneratingSku] = useState(false);
  const [sku, setSku] = useState(initialData?.sku || '');
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [costPrice, setCostPrice] = useState(initialData?.cost_price || 0);
  const [pixPrice, setPixPrice] = useState(initialData?.pix_price || 0);
  const [cardPrice, setCardPrice] = useState(initialData?.card_price || 0);

  const profit = pixPrice - costPrice;
  const margin = costPrice > 0 ? (profit / costPrice) * 100 : 0;

  const handleGenerateSku = async () => {
    if (!name || !category) {
      alert('Preencha o nome e a categoria primeiro.');
      return;
    }
    
    setIsGeneratingSku(true);
    try {
      const res = await fetch('/api/admin/generate-sku', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category }),
      });
      
      if (!res.ok) throw new Error('Falha ao gerar SKU');
      
      const data = await res.json();
      setSku(data.sku);
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar SKU. Verifique se a API Key do Gemini está configurada.');
    } finally {
      setIsGeneratingSku(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would save to Supabase here
    alert('Produto salvo com sucesso! (Simulação)');
    router.push('/admin/products');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-background-secondary rounded-xl border border-background-tertiary p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/products" className="inline-flex items-center text-text-support hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-support mb-2">Nome do Produto</label>
          <input 
            type="text" 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-support mb-2">Categoria</label>
          <input 
            type="text" 
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-support mb-2">SKU</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
            />
            <button 
              type="button"
              onClick={handleGenerateSku}
              disabled={isGeneratingSku}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-background-tertiary hover:bg-primary/20 text-primary rounded-lg transition-colors whitespace-nowrap"
            >
              {isGeneratingSku ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              Gerar IA
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-support mb-2">Descrição</label>
          <textarea 
            rows={4}
            className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
            defaultValue={initialData?.description}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-support mb-2">Preço de Custo (R$)</label>
          <input 
            type="number" 
            step="0.01"
            required
            value={costPrice}
            onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-support mb-2">Quantidade em Estoque</label>
          <input 
            type="number" 
            required
            defaultValue={initialData?.stock_quantity || 0}
            className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-support mb-2">Preço de Venda PIX (R$)</label>
          <input 
            type="number" 
            step="0.01"
            required
            value={pixPrice}
            onChange={(e) => setPixPrice(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-success focus:outline-none focus:border-primary font-bold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-support mb-2">Preço de Venda Cartão (R$)</label>
          <input 
            type="number" 
            step="0.01"
            required
            value={cardPrice}
            onChange={(e) => setCardPrice(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
          />
        </div>

        <div className="md:col-span-2 bg-background-main p-4 rounded-lg border border-background-tertiary flex flex-col sm:flex-row gap-6 justify-between items-center">
          <div>
            <p className="text-sm text-text-support mb-1">Lucro Real (PIX)</p>
            <p className="text-xl font-bold text-accent">{formatCurrency(profit)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-support mb-1">Margem de Lucro</p>
            <p className="text-xl font-bold text-accent">{margin.toFixed(2)}%</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-support mb-2">Link Externo (YouTube, etc) - Opcional</label>
          <input 
            type="url" 
            defaultValue={initialData?.external_link}
            className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-support mb-2">URL da Imagem (Simulação de Upload)</label>
          <input 
            type="url" 
            defaultValue={initialData?.image_url}
            className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t border-background-tertiary pt-6">
        <Link href="/admin/products" className="px-6 py-2 rounded-lg text-text-main hover:bg-background-tertiary transition-colors">
          Cancelar
        </Link>
        <button type="submit" className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-background-main font-medium py-2 px-6 rounded-lg transition-colors">
          <Save className="w-5 h-5" />
          Salvar Produto
        </button>
      </div>
    </form>
  );
}
