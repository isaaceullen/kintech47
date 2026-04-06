import Link from 'next/link';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Popup } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function AdminPopups() {
  let popups: Popup[] = [];
  let error = null;

  try {
    const supabase = await createClient();
    const { data, error: fetchError } = await supabase
      .from('popups')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;
    popups = data || [];
  } catch (err: any) {
    console.error('Error fetching popups:', err);
    error = err.message || 'Erro ao carregar popups';
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-text-main">Gerenciar Pop-ups</h1>
        <Link 
          href="/admin/popups/new" 
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-background-main px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Pop-up
        </Link>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-background-secondary rounded-xl border border-background-tertiary overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-tertiary/50 border-b border-background-tertiary">
                <th className="p-4 font-medium text-text-support">Título</th>
                <th className="p-4 font-medium text-text-support">Status</th>
                <th className="p-4 font-medium text-text-support">Data de Criação</th>
                <th className="p-4 font-medium text-text-support text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {popups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-support">
                    Nenhum pop-up cadastrado.
                  </td>
                </tr>
              ) : (
                popups.map((popup) => (
                  <tr key={popup.id} className="border-b border-background-tertiary hover:bg-background-tertiary/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-text-main">{popup.title}</div>
                      <div className="text-sm text-text-support truncate max-w-xs">{popup.description}</div>
                    </td>
                    <td className="p-4">
                      {popup.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                          <CheckCircle className="w-3 h-3" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-text-support/10 text-text-support">
                          <XCircle className="w-3 h-3" />
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-text-support">
                      {new Date(popup.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/popups/${popup.id}/edit`}
                          className="p-2 text-text-support hover:text-primary transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
