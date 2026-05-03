import Navbar from '@/components/Navbar';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-[1400px] mx-auto px-2 sm:px-4 lg:px-6 py-6 w-full animate-pulse">
        <div className="w-48 h-4 bg-background-tertiary rounded mb-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          <div className="aspect-square w-full rounded-2xl bg-background-tertiary border border-background-tertiary"></div>

          <div className="flex flex-col">
            <div className="w-32 h-4 bg-background-tertiary rounded mb-4"></div>
            <div className="w-3/4 h-10 bg-background-tertiary rounded mb-4"></div>
            <div className="w-24 h-4 bg-background-tertiary rounded mb-6"></div>
            
            <div className="bg-background-secondary p-6 rounded-xl border border-background-tertiary mb-8">
              <div className="w-48 h-10 bg-background-tertiary rounded mb-2"></div>
              <div className="w-64 h-6 bg-background-tertiary rounded mt-2"></div>
            </div>

            <div className="mb-8">
              <div className="w-32 h-6 bg-background-tertiary rounded mb-3"></div>
              <div className="w-full h-4 bg-background-tertiary rounded mb-2"></div>
              <div className="w-full h-4 bg-background-tertiary rounded mb-2"></div>
              <div className="w-2/3 h-4 bg-background-tertiary rounded"></div>
            </div>

            <div className="mt-auto flex flex-col gap-4">
              <div className="w-full h-12 bg-background-tertiary rounded-xl"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
