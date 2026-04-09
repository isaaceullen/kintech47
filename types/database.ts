export type Product = {
  id: string;
  created_at: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  cost_price: number;
  pix_price: number;
  card_price: number;
  image_urls: string[];
  external_link?: string;
  is_out_of_stock: boolean;
  is_promo_active?: boolean;
  discount_type?: 'percentage' | 'fixed';
  discount_amount?: number;
};

export type CartItem = Product & {
  cartQuantity: number;
};

export type Popup = {
  id: string;
  created_at: string;
  title: string;
  description: string;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  is_active: boolean;
  target_type?: 'home' | 'cart' | 'all_products' | 'specific_product' | 'all_pages';
  target_product_id?: string | null;
};

export type Category = {
  id: string;
  created_at: string;
  name: string;
  slug: string;
};

export type Sale = {
  id: string;
  created_at: string;
  product_id: string;
  product_name: string;
  cost_price: number;
  sale_price: number;
  payment_method: 'PIX' | 'Cartão';
  profit: number;
};
