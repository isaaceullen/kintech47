'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardClient({ initialMetrics }: { initialMetrics: { totalSales: number, totalProfit: number, productsInStock: number } }) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [isSaving, setIsSaving] = useState(false);
  const [salesInput, setSalesInput] = useState(initialMetrics.totalSales);
  const [profitInput, setProfitInput] = useState(initialMetrics.totalProfit);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('dashboard_settings')
        .upsert({ id: 1, total_sales: salesInput, total_profit: profitInput });

      if (error) throw error;
      
      setMetrics(prev => ({
        ...prev,
        totalSales: salesInput,
        totalProfit: profitInput
      }));
      
      alert('Métricas atualizadas com sucesso!');
    } catch (error) {
      console.error('Error updating metrics:', error);
      alert('Erro ao atualizar métricas. Verifique se a tabela dashboard_settings existe.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-background-secondary p-6 rounded-xl border border-background-tertiary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-support font-medium">Total de Vendas</h3>
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text-main">{metrics.totalSales}</p>
          <p className="text-sm text-text-support mt-2">Atualizado manualmente</p>
        </div>
        
        <div className="bg-background-secondary p-6 rounded-xl border border-background-tertiary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-support font-medium">Lucro Total</h3>
            <div className="p-2 bg-success/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
          </div>
          <p className="text-3xl font-bold text-success">{formatCurrency(metrics.totalProfit)}</p>
          <p className="text-sm text-text-support mt-2">Atualizado manualmente</p>
        </div>
        
        <div className="bg-background-secondary p-6 rounded-xl border border-background-tertiary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-support font-medium">Produtos em Estoque</h3>
            <div className="p-2 bg-accent/10 rounded-lg">
              <Package className="w-5 h-5 text-accent" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text-main">{metrics.productsInStock}</p>
          <p className="text-sm text-text-support mt-2">Baseado no cadastro</p>
        </div>
      </div>
      
      <div className="bg-background-secondary rounded-xl border border-background-tertiary p-6">
        <h2 className="text-xl font-bold text-text-main mb-4">Atualizar Métricas</h2>
        <p className="text-text-support mb-6">Como as vendas ocorrem via WhatsApp, atualize os valores gerais aqui para acompanhamento.</p>
        
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-support mb-2">Total de Vendas (Qtd)</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
              value={salesInput}
              onChange={(e) => setSalesInput(parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-support mb-2">Lucro Total (R$)</label>
            <input 
              type="number" 
              step="0.01"
              className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
              value={profitInput}
              onChange={(e) => setProfitInput(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="md:col-span-2">
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-primary hover:bg-primary-hover text-background-main font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-background-main"></div>
              ) : 'Salvar Métricas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
