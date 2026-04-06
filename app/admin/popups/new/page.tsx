import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PopupForm from '@/components/admin/PopupForm';

export const dynamic = 'force-dynamic';

export default function NewPopupPage() {
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
        <h1 className="text-2xl font-bold text-text-main">Novo Pop-up</h1>
        <p className="text-text-support mt-1">Crie um novo pop-up para exibir na loja.</p>
      </div>

      <PopupForm />
    </div>
  );
}
