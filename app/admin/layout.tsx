import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Package, LogOut, Home, Tags } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background-main">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-background-secondary border-r border-background-tertiary flex-shrink-0 flex flex-col">
        <div className="p-6">
          <Image
            src="https://i.imgur.com/o2m4oj2.png"
            alt="Logo"
            width={150}
            height={50}
            className="h-10 w-auto object-contain mb-8"
            referrerPolicy="no-referrer"
          />
          <nav className="space-y-2">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-text-main hover:bg-background-tertiary rounded-lg transition-colors">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              Dashboard
            </Link>
            <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 text-text-main hover:bg-background-tertiary rounded-lg transition-colors">
              <Package className="w-5 h-5 text-primary" />
              Produtos
            </Link>
            <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-3 text-text-main hover:bg-background-tertiary rounded-lg transition-colors">
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
      <main className="flex-grow p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
