'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Package, LogOut, Home, Tags, Menu, X, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check local storage mock auth
      if (localStorage.getItem('kintech_dev_auth') === 'true') {
        setIsCheckingAuth(false);
        return;
      }

      // 2. Otherwise check Supabase real auth
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session && pathname !== '/admin/login') {
        // If no real session and we're not on login, enforce redirect (handling cases where middleware didn't catch it)
        router.replace('/admin/login');
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (isCheckingAuth && pathname !== '/admin/login') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background-main">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            <Link 
              href="/admin/popups" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-text-main hover:bg-background-tertiary rounded-lg transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-primary" />
              Pop-ups
            </Link>
          </nav>
        </div>
        <div className="p-6 mt-auto border-t border-background-tertiary">
          <Link href="/" className="flex items-center gap-3 px-4 py-2 text-text-support hover:text-text-main transition-colors mb-2">
            <Home className="w-4 h-4" />
            Ver Loja
          </Link>
          <button 
            onClick={async () => { 
              localStorage.removeItem('kintech_dev_auth'); 
              await fetch('/api/auth/signout', { method: 'POST' });
              window.location.href = '/admin/login';
            }} 
            className="flex items-center gap-3 px-4 py-2 text-danger hover:bg-danger/10 rounded-lg transition-colors w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
