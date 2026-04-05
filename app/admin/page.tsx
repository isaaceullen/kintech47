import { DollarSign, TrendingUp, Package } from 'lucide-react';

export default function AdminDashboard() {
  // Mock data for now
  const metrics = {
    totalSales: 154,
    totalProfit: 12500.50,
    productsInStock: 342,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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
        
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-support mb-2">Total de Vendas (Qtd)</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
              defaultValue={metrics.totalSales}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-support mb-2">Lucro Total (R$)</label>
            <input 
              type="number" 
              step="0.01"
              className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
              defaultValue={metrics.totalProfit}
            />
          </div>
          <div className="md:col-span-2">
            <button type="button" className="bg-primary hover:bg-primary-hover text-background-main font-medium py-2 px-6 rounded-lg transition-colors">
              Salvar Métricas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
