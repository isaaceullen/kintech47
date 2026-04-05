import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types/database';

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPix: () => number;
  getTotalCard: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, cartQuantity: item.cartQuantity + 1 }
                  : item
              ),
            };
          }
          return { items: [...state.items, { ...product, cartQuantity: 1 }] };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, cartQuantity: Math.max(1, quantity) } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalPix: () => {
        return get().items.reduce((total, item) => total + item.pix_price * item.cartQuantity, 0);
      },
      getTotalCard: () => {
        return get().items.reduce((total, item) => total + item.card_price * item.cartQuantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
