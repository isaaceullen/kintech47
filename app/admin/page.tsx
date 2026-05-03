import { createClient } from '@/lib/supabase/server';
import DashboardClient from '@/components/admin/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  let sales = [];
  let productsInStock = 0;

  try {
    const supabase = await createClient();
    
    // Fetch sales
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (salesError) {
      console.error('Error fetching sales:', salesError);
    } else {
      sales = salesData || [];
    }

    // Fetch product count
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
      
    productsInStock = count || 0;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }

  return <DashboardClient initialSales={sales} productsInStock={productsInStock} />;
}
