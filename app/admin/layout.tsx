'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Package, LogOut, Home, Tags, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen md:overflow-hidden bg-background-main">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-background-secondary border-b border-background-tertiary">
        <Image
          src="https://i.imgur.com/7Zn0fr7.png"
          alt="Logo"
          width={120}
          height={40}
          className="h-8 w-auto object-contain"
          referrerPolicy="no-referrer"
        />
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-text-main hover:bg-background-tertiary rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-64 bg-background-secondary border-r border-background-tertiary flex-shrink-0 flex-col md:h-full`}>
        <div className="p-6">
          <div className="hidden md:block mb-8">
            <Image
              src="https://i.imgur.com/7Zn0fr7.png"
              alt="Logo"
              width={150}
              height={50}
              className="h-10 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <nav className="space-y-2">
            <Link 
              href="/admin" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-text-main hover:bg-background-tertiary rounded-lg transition-colors"
            >
              <LayoutDashboard className="w-5 h-5 text-primary" />
              Dashboard
            </Link>
            <Link 
              href="/admin/products" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-text-main hover:bg-background-tertiary rounded-lg transition-colors"
            >
              <Package className="w-5 h-5 text-primary" />
              Produtos
            </Link>
            <Link 
              href="/admin/categories" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-text-main hover:bg-background-tertiary rounded-lg transition-colors"
            >
              <Tags className="w-5 h-5 text-primary" />
              Categorias
            </Link>
          </nav>
        </div>
        <div className="p-6 mt-auto border-t border-background-tertiary">
          <Link href="/" className="flex items-center gap-3 px-4 py-2 text-text-support hover:text-text-main transition-colors mb-2">
            <Home className="w-4 h-4" />
            Ver Loja
          </Link>
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="flex items-center gap-3 px-4 py-2 text-danger hover:bg-danger/10 rounded-lg transition-colors w-full text-left">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
