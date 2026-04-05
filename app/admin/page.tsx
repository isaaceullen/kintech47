import { createClient } from '@/lib/supabase/server';
import DashboardClient from '@/components/admin/DashboardClient';

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  let totalSales = 0;
  let totalProfit = 0;
  let productsInStock = 0;

  try {
    // Fetch dashboard settings
    const { data: settings } = await supabase
      .from('dashboard_settings')
      .select('*')
      .eq('id', 1)
      .single();
      
    if (settings) {
      totalSales = settings.total_sales || 0;
      totalProfit = settings.total_profit || 0;
    }

    // Fetch product count
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
      
    productsInStock = count || 0;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }

  const metrics = {
    totalSales,
    totalProfit,
    productsInStock,
  };

  return <DashboardClient initialMetrics={metrics} />;
}
