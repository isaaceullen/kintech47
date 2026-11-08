export default function LoadingProduct() {
  return (
    <main className="max-w-[1400px] mx-auto px-6 py-12" aria-busy="true" aria-label="Carregando produto">
      <div className="h-5 w-40 bg-background-tertiary rounded mb-8 animate-pulse" />
      <div className="grid md:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square rounded-2xl bg-background-secondary" />
        <div className="space-y-6"><div className="h-10 rounded bg-background-tertiary" /><div className="h-6 w-2/3 rounded bg-background-tertiary" /><div className="h-40 rounded-2xl bg-background-secondary" /><div className="h-24 rounded bg-background-secondary" /></div>
      </div>
    </main>
  );
}
