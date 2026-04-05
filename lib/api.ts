import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types/database';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    sku: 'PROD01',
    name: 'Smartphone Premium X',
    category: 'Eletrônicos',
    description: 'Um smartphone incrível com câmera de alta resolução.',
    cost_price: 2500,
    pix_price: 3500,
    card_price: 3800,
    image_urls: ['https://picsum.photos/seed/smartphone/400/400'],
    is_out_of_stock: false,
  },
  {
    id: '2',
    created_at: new Date().toISOString(),
    sku: 'PROD02',
    name: 'Fone de Ouvido Noise Cancelling',
    category: 'Acessórios',
    description: 'Fones com cancelamento de ruído ativo e bateria de longa duração.',
    cost_price: 400,
    pix_price: 800,
    card_price: 850,
    image_urls: ['https://picsum.photos/seed/headphones/400/400'],
    is_out_of_stock: false,
  },
  {
    id: '3',
    created_at: new Date().toISOString(),
    sku: 'PROD03',
    name: 'Smartwatch Esportivo',
    category: 'Eletrônicos',
    description: 'Relógio inteligente com monitoramento cardíaco e GPS.',
    cost_price: 600,
    pix_price: 1200,
    card_price: 1300,
    image_urls: ['https://picsum.photos/seed/smartwatch/400/400'],
    is_out_of_stock: true,
  }
];

export async function getProducts(): Promise<Product[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'YOUR_SUPABASE_URL') {
      return MOCK_PRODUCTS;
    }
    
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return MOCK_PRODUCTS;
  }
}

export async function getProductBySku(sku: string): Promise<Product | null> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'YOUR_SUPABASE_URL') {
      return MOCK_PRODUCTS.find(p => p.sku === sku) || null;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return MOCK_PRODUCTS.find(p => p.sku === sku) || null;
  }
}
