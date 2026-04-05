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
};

export type CartItem = Product & {
  cartQuantity: number;
};
