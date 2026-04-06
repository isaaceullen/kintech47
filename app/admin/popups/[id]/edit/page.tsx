import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import PopupForm from '@/components/admin/PopupForm';

export const dynamic = 'force-dynamic';

export default async function EditPopupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: popup, error } = await supabase
    .from('popups')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !popup) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <Link 
          href="/admin/popups" 
          className="inline-flex items-center text-text-support hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Pop-ups
        </Link>
        <h1 className="text-2xl font-bold text-text-main">Editar Pop-up</h1>
        <p className="text-text-support mt-1">Atualize as informações do pop-up.</p>
      </div>

      <PopupForm initialData={popup} />
    </div>
  );
}
