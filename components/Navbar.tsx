'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, LogIn } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((acc, item) => acc + item.cartQuantity, 0);

  return (
    <nav className="bg-background-secondary border-b border-background-tertiary sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Image
              src="https://i.imgur.com/o2m4oj2.png"
              alt="Logo"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/cart" className="relative text-text-main hover:text-primary transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-background-main text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
