'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wand2, Save, ArrowLeft, Upload, Link as LinkIcon, Trash2, Power } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function ProductForm({ initialData, categories = [] }: { initialData?: any, categories?: any[] }) {
  const router = useRouter();
  const [isGeneratingSku, setIsGeneratingSku] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [sku, setSku] = useState(initialData?.sku || '');
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [costPrice, setCostPrice] = useState(Number(initialData?.cost_price || 0));
  const [pixPrice, setPixPrice] = useState(Number(initialData?.pix_price || 0));
  const [cardPrice, setCardPrice] = useState(Number(initialData?.card_price || 0));
  const [isOutOfStock, setIsOutOfStock] = useState(Boolean(initialData?.is_out_of_stock));
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [externalLink, setExternalLink] = useState(initialData?.external_link || '');
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description || '');
  
  const [isPromoActive, setIsPromoActive] = useState(Boolean(initialData?.is_promo_active));
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(initialData?.discount_type || 'percentage');
  const [discountAmount, setDiscountAmount] = useState(Number(initialData?.discount_amount || 0));

  const [imageUrls, setImageUrls] = useState<string[]>(() => {
    let safeImages = ['', '', ''];
    if (initialData?.image_urls && Array.isArray(initialData.image_urls)) {
      safeImages = [
        initialData.image_urls[0] || '',
        initialData.image_urls[1] || '',
        initialData.image_urls[2] || ''
      ];
    }
    return safeImages;
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const profit = pixPrice - costPrice;
  const margin = costPrice > 0 ? (profit / costPrice) * 100 : 0;

  let promoPixPrice = pixPrice;
  if (isPromoActive) {
    if (discountType === 'percentage') {
      promoPixPrice = pixPrice - (pixPrice * (discountAmount / 100));
    } else {
      promoPixPrice = pixPrice - discountAmount;
    }
    // Ensure it doesn't go below 0
    promoPixPrice = Math.max(0, promoPixPrice);
  }
  
  const promoCardPrice = isPromoActive ? Math.ceil(promoPixPrice * 1.14) : cardPrice;
  const promoProfit = promoPixPrice - costPrice;
  const promoMargin = costPrice > 0 ? (promoProfit / costPrice) * 100 : 0;

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

  const handleRemoveImage = (index: number) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = '';
    setImageUrls(newImageUrls);
  };

  const handleUrlChange = (value: string, index: number) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro detalhado do Supabase Storage:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const newImageUrls = [...imageUrls];
      newImageUrls[index] = publicUrl;
      setImageUrls(newImageUrls);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(`Erro ao fazer upload da imagem: ${error.message || 'Verifique se o bucket "product-images" existe e é público.'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSubmitError(null);
    
    try {
      const supabase = createClient();
      
      const finalImageUrls = imageUrls?.filter(url => url && typeof url === 'string' && url.trim() !== '') || [];

      const productData = {
        sku,
        name,
        category,
        description,
        cost_price: costPrice,
        pix_price: pixPrice,
        card_price: cardPrice,
        image_urls: finalImageUrls,
        external_link: externalLink,
        is_out_of_stock: isOutOfStock,
        is_active: isActive,
        is_promo_active: isPromoActive,
        discount_type: discountType,
        discount_amount: discountAmount,
        seo_title: seoTitle,
        seo_description: seoDescription,
      };

      let error;
      
      if (initialData?.id) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', initialData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert([productData]);
        error = insertError;
      }

      if (error) {
        console.error('Detalhes do erro do Supabase ao salvar produto:', error);
        setSubmitError(`Erro do banco: ${error.message || JSON.stringify(error)}`);
        toast.error('Erro ao salvar produto!');
        return;
      }
      
      toast.success('Produto salvo com sucesso!');
      router.push('/admin/products');
      router.refresh();
    } catch (error: any) {
      console.error('Erro inesperado ao salvar produto:', error);
      setSubmitError(`Erro inesperado: ${error.message || 'Falha ao salvar'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-background-secondary rounded-xl border border-background-tertiary p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/products" className="inline-flex items-center text-text-support hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>
        
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors flex items-center gap-2 outline-none ${
            isActive 
              ? 'text-danger border-danger/30 hover:bg-danger/10' 
              : 'text-success border-success/30 hover:bg-success/10'
          }`}
        >
          <Power className="w-4 h-4" />
          {isActive ? 'Desativar Produto' : 'Ativar Produto'}
        </button>
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
          <select 
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary appearance-none"
          >
            <option value="" disabled>Selecione uma categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
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
          <label className="block text-sm font-medium text-text-support mb-2">Status de Estoque</label>
          <div className="flex items-center h-10">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only"
                  checked={isOutOfStock}
                  onChange={(e) => setIsOutOfStock(e.target.checked)}
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${isOutOfStock ? 'bg-danger' : 'bg-success'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isOutOfStock ? 'transform translate-x-6' : ''}`}></div>
              </div>
              <div className="ml-3 text-sm font-medium text-text-main">
                {isOutOfStock ? 'Esgotado' : 'Em Estoque'}
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-support mb-2">Preço de Venda PIX (R$)</label>
          <input 
            type="number" 
            step="0.01"
            required
            value={pixPrice}
            onChange={(e) => {
              const newPixPrice = parseFloat(e.target.value) || 0;
              setPixPrice(newPixPrice);
              if (newPixPrice > 0) {
                setCardPrice(Math.ceil(newPixPrice * 1.14));
              } else {
                setCardPrice(0);
              }
            }}
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

        <div className="md:col-span-2 border-t border-background-tertiary pt-6 mt-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-text-main">Promoção</h3>
              <p className="text-sm text-text-support">Ative para aplicar um desconto neste produto.</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only"
                  checked={isPromoActive}
                  onChange={(e) => setIsPromoActive(e.target.checked)}
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${isPromoActive ? 'bg-primary' : 'bg-background-tertiary'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isPromoActive ? 'transform translate-x-6' : ''}`}></div>
              </div>
            </label>
          </div>

          {isPromoActive && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-background-main p-4 rounded-lg border border-primary/30">
              <div>
                <label className="block text-sm font-medium text-text-support mb-2">Tipo de Desconto</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                  className="w-full px-4 py-2 bg-background-secondary border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary appearance-none"
                >
                  <option value="percentage">% Porcentagem</option>
                  <option value="fixed">R$ Valor Fixo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-support mb-2">
                  Valor do Desconto {discountType === 'percentage' ? '(%)' : '(R$)'}
                </label>
                <input 
                  type="number" 
                  step={discountType === 'percentage' ? "1" : "0.01"}
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 bg-background-secondary border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
                />
              </div>
              
              <div className="md:col-span-2 bg-background-secondary p-4 rounded-lg border border-background-tertiary">
                <h4 className="text-sm font-bold text-text-main mb-3">Preview do Preço Final</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-text-support mb-1">PIX (Original)</p>
                    <p className="text-sm text-text-support line-through">{formatCurrency(pixPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-support mb-1">PIX (Promoção)</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(promoPixPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-support mb-1">Cartão (Promoção)</p>
                    <p className="text-sm font-medium text-text-main">{formatCurrency(promoCardPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-support mb-1">Lucro Real (Promo)</p>
                    <p className={`text-sm font-bold ${promoProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(promoProfit)} ({promoMargin.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
          />
        </div>
        
        <div className="md:col-span-2 border-t border-background-tertiary pt-6 mt-2">
          <h3 className="text-lg font-bold text-text-main mb-4">SEO (Google)</h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-text-support">Título para o Google</label>
                <span className={`text-xs ${seoTitle.length > 60 ? 'text-danger' : 'text-text-support'}`}>
                  {seoTitle.length} / 60 caracteres (ideal)
                </span>
              </div>
              <input 
                type="text" 
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Ex: Perfume X 100ml Original - Melhor Preço"
                className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-text-support">Descrição para o Google</label>
                <span className={`text-xs ${seoDescription.length > 160 ? 'text-danger' : 'text-text-support'}`}>
                  {seoDescription.length} / 160 caracteres (ideal)
                </span>
              </div>
              <textarea 
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Uma breve descrição chamativa sobre o produto para aparecer nos resultados de busca."
                className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-support mb-4">Imagens do Produto (Máx. 3)</label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex flex-col gap-3 p-4 border border-background-tertiary rounded-xl bg-background-main">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-text-main">Slot {index + 1}</span>
                  {imageUrls[index] && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="text-xs text-danger hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remover
                    </button>
                  )}
                </div>
                
                <div className="relative aspect-square rounded-lg border border-background-tertiary flex flex-col items-center justify-center bg-background-secondary overflow-hidden">
                  {imageUrls[index] ? (
                    <img src={imageUrls[index]} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-text-support text-xs">Sem imagem</span>
                  )}
                </div>
                
                <div className="flex gap-2 mt-1">
                  <input 
                    type="url" 
                    placeholder="Cole a URL..."
                    value={imageUrls[index]}
                    onChange={(e) => handleUrlChange(e.target.value, index)}
                    className="flex-grow px-3 py-2 text-sm bg-background-secondary border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
                  />
                  <label className="cursor-pointer flex items-center justify-center px-3 py-2 bg-background-tertiary hover:bg-primary/20 text-primary rounded-lg transition-colors" title="Fazer Upload">
                    <Upload className="w-4 h-4" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, index)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {submitError && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
          <p className="font-bold mb-1">Erro ao salvar:</p>
          <p>{submitError}</p>
        </div>
      )}

      <div className="flex justify-end gap-4 border-t border-background-tertiary pt-6">
        <Link href="/admin/products" className="px-6 py-2 rounded-lg text-text-main hover:bg-background-tertiary transition-colors">
          Cancelar
        </Link>
        <button 
          type="submit" 
          disabled={isSaving}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-background-main font-medium py-2 px-6 rounded-lg transition-colors"
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-background-main"></div>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvar Produto
            </>
          )}
        </button>
      </div>
    </form>
  );
}
