'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { DollarSign, TrendingUp, Package, TrendingDown, Edit, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Sale } from '@/types/database';

const RechartsClient = dynamic(() => import('./RechartsClient'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-text-support">Carregando gráfico...</div>
});

type DashboardClientProps = {
  initialSales: Sale[];
  productsInStock: number;
};

export default function DashboardClient({ initialSales, productsInStock }: DashboardClientProps) {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit form state
  const [editPrice, setEditPrice] = useState<string>('');
  const [editMethod, setEditMethod] = useState<'PIX' | 'Cartão'>('PIX');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Calculate KPIs
  const totalSalesCount = sales.length;
  const totalProfit = sales.reduce((acc, sale) => acc + sale.profit, 0);
  const totalLosses = sales.reduce((acc, sale) => sale.profit < 0 ? acc + sale.profit : acc, 0);

  // Prepare Chart Data (Group by Product for simplicity, or by Date)
  // Let's group by Date (last 7 days or just show recent sales)
  // For a simple bar chart, let's show the last 10 sales
  const chartData = sales.slice(0, 10).reverse().map(sale => ({
    name: (sale.product_name || 'Produto').substring(0, 15) + '...',
    'Custo Total': sale.cost_price,
    'Faturamento Total': sale.sale_price,
  }));

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro de venda?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw error;
      
      setSales(sales.filter(s => s.id !== id));
      toast.success('Venda excluída com sucesso!');
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting sale:', error);
      toast.error('Erro ao excluir venda');
    }
  };

  const openEditModal = (sale: Sale) => {
    setEditingSale(sale);
    setEditPrice(sale.sale_price.toString());
    setEditMethod(sale.payment_method);
  };

  const handleEditSubmit = async () => {
    if (!editingSale) return;
    
    const finalPrice = parseFloat(editPrice);
    if (isNaN(finalPrice) || finalPrice < 0) {
      toast.error('Valor inválido');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const newProfit = finalPrice - editingSale.cost_price;

      const { error } = await supabase
        .from('sales')
        .update({
          sale_price: finalPrice,
          payment_method: editMethod,
          profit: newProfit
        })
        .eq('id', editingSale.id);

      if (error) throw error;

      // Update local state
      setSales(sales.map(s => s.id === editingSale.id ? { ...s, sale_price: finalPrice, payment_method: editMethod, profit: newProfit } : s));
      
      toast.success('Venda atualizada com sucesso!');
      setEditingSale(null);
      router.refresh();
    } catch (error: any) {
      console.error('Error updating sale:', error);
      toast.error('Erro ao atualizar venda');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-8">Dashboard Financeiro</h1>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-background-secondary p-6 rounded-xl border border-background-tertiary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-support font-medium">Total de Vendas</h3>
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text-main">{totalSalesCount}</p>
          <p className="text-sm text-text-support mt-2">Registros na plataforma</p>
        </div>
        
        <div className="bg-background-secondary p-6 rounded-xl border border-background-tertiary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-support font-medium">Lucro Total</h3>
            <div className="p-2 bg-success/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
          </div>
          <p className="text-3xl font-bold text-success">{formatCurrency(totalProfit)}</p>
          <p className="text-sm text-text-support mt-2">Faturamento - Custo</p>
        </div>
        
        <div className="bg-background-secondary p-6 rounded-xl border border-background-tertiary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-support font-medium">Perdas</h3>
            <div className="p-2 bg-danger/10 rounded-lg">
              <TrendingDown className="w-5 h-5 text-danger" />
            </div>
          </div>
          <p className="text-3xl font-bold text-danger">{formatCurrency(totalLosses)}</p>
          <p className="text-sm text-text-support mt-2">Vendas com lucro negativo</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-background-secondary p-6 rounded-xl border border-background-tertiary mb-10">
        <h2 className="text-xl font-bold text-text-main mb-6">Comparativo: Custo vs Faturamento (Últimas Vendas)</h2>
        <div className="h-80 w-full">
          <RechartsClient data={chartData} />
        </div>
      </div>
      
      {/* Sales History Table */}
      <div className="bg-background-secondary rounded-xl border border-background-tertiary overflow-hidden">
        <div className="p-6 border-b border-background-tertiary">
          <h2 className="text-xl font-bold text-text-main">Histórico de Vendas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-tertiary/50 border-b border-background-tertiary">
                <th className="p-4 font-medium text-text-support">Data</th>
                <th className="p-4 font-medium text-text-support">Produto</th>
                <th className="p-4 font-medium text-text-support">Pagamento</th>
                <th className="p-4 font-medium text-text-support">Valor da Venda</th>
                <th className="p-4 font-medium text-text-support">Lucro Real</th>
                <th className="p-4 font-medium text-text-support text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-support">
                    Nenhuma venda registrada ainda.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-background-tertiary hover:bg-background-tertiary/20 transition-colors">
                    <td className="p-4 text-text-main">
                      {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-text-main font-medium">
                      {sale.product_name}
                    </td>
                    <td className="p-4 text-text-support">
                      {sale.payment_method}
                    </td>
                    <td className="p-4 text-text-main">
                      {formatCurrency(sale.sale_price)}
                    </td>
                    <td className={`p-4 font-medium ${sale.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(sale.profit)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(sale)}
                          className="p-2 text-text-support hover:text-primary transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(sale.id)}
                          className="p-2 text-text-support hover:text-danger transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-main/80 backdrop-blur-sm">
          <div className="bg-background-secondary rounded-xl border border-background-tertiary w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-text-main mb-4">Editar Venda</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-support mb-1">Produto</label>
                  <input 
                    type="text" 
                    value={editingSale.product_name} 
                    readOnly 
                    className="w-full px-3 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-support cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-support mb-1">Custo</label>
                  <input 
                    type="text" 
                    value={formatCurrency(editingSale.cost_price)} 
                    readOnly 
                    className="w-full px-3 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-support cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-support mb-1">Forma de Pagamento</label>
                  <select
                    value={editMethod}
                    onChange={(e) => setEditMethod(e.target.value as 'PIX' | 'Cartão')}
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
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-background-tertiary flex justify-end gap-3 bg-background-main/50">
              <button 
                onClick={() => setEditingSale(null)}
                disabled={isSubmitting}
                className="px-4 py-2 text-text-support hover:text-text-main font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleEditSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-background-main rounded-lg font-medium transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
