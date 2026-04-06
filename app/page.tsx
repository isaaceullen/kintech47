import Navbar from '@/components/Navbar';
import ProductList from '@/components/ProductList';
import PopupModal from '@/components/PopupModal';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-main mb-2">Catálogo de Produtos</h1>
          <p className="text-text-support">Encontre os melhores produtos com os melhores preços.</p>
        </div>
        <ProductList />
      </main>
      <PopupModal />
    </div>
  );
}
