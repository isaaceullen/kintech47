'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Popup } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { Save, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

type PopupFormProps = {
  initialData?: Popup;
};

export default function PopupForm({ initialData }: PopupFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    image_url: initialData?.image_url || '',
    button_text: initialData?.button_text || '',
    button_link: initialData?.button_link || '',
    is_active: initialData?.is_active || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `popups/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Imagem carregada com sucesso!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao carregar imagem: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // If setting this to active, we need to deactivate others
      if (formData.is_active) {
        await supabase
          .from('popups')
          .update({ is_active: false })
          .neq('id', initialData?.id || '00000000-0000-0000-0000-000000000000'); // Dummy UUID if new
      }

      const popupData = {
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url || null,
        button_text: formData.button_text || null,
        button_link: formData.button_link || null,
        is_active: formData.is_active,
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from('popups')
          .update(popupData)
          .eq('id', initialData.id);
        if (error) throw error;
        toast.success('Pop-up atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('popups')
          .insert([popupData]);
        if (error) throw error;
        toast.success('Pop-up criado com sucesso!');
      }

      router.push('/admin/popups');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving popup:', error);
      toast.error('Erro ao salvar pop-up: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    
    if (!confirm('Tem certeza que deseja excluir este pop-up?')) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('popups')
        .delete()
        .eq('id', initialData.id);

      if (error) throw error;
      
      toast.success('Pop-up excluído com sucesso!');
      router.push('/admin/popups');
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting popup:', error);
      toast.error('Erro ao excluir pop-up');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div className="bg-background-secondary p-6 rounded-xl border border-background-tertiary space-y-6">
        
        {/* Toggle Ativo */}
        <div className="flex items-center justify-between p-4 bg-background-main rounded-lg border border-background-tertiary">
          <div>
            <h3 className="font-medium text-text-main">Status do Pop-up</h3>
            <p className="text-sm text-text-support">Apenas um pop-up pode estar ativo por vez.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-background-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-support mb-2">Título *</label>
            <input 
              type="text" 
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
              placeholder="Ex: Promoção de Inverno"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-support mb-2">Descrição *</label>
            <textarea 
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary resize-none"
              placeholder="Texto que aparecerá no corpo do pop-up..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-support mb-2">Imagem de Destaque</label>
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <input 
                type="text" 
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary mb-3"
                placeholder="URL da imagem ou faça upload abaixo"
              />
              
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg text-sm font-medium transition-colors
                  ${isUploading ? 'border-background-tertiary text-text-support bg-background-tertiary/20' : 'border-primary/50 text-primary hover:bg-primary/5 hover:border-primary'}`}
                >
                  {isUploading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                  ) : (
                    <><ImageIcon className="w-5 h-5" /> Fazer upload de imagem</>
                  )}
                </div>
              </div>
            </div>

            {formData.image_url && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-background-tertiary flex-shrink-0">
                <Image
                  src={formData.image_url}
                  alt="Preview"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-support mb-2">Texto do Botão</label>
            <input 
              type="text" 
              name="button_text"
              value={formData.button_text}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
              placeholder="Ex: Ver Ofertas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-support mb-2">Link do Botão</label>
            <input 
              type="text" 
              name="button_link"
              value={formData.button_link}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
              placeholder="Ex: /categoria/promocoes"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        {initialData?.id ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-danger hover:bg-danger/10 rounded-lg transition-colors font-medium"
          >
            <Trash2 className="w-5 h-5" />
            Excluir Pop-up
          </button>
        ) : (
          <div></div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push('/admin/popups')}
            disabled={isSubmitting}
            className="px-6 py-2 text-text-main hover:bg-background-tertiary rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-background-main px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {initialData ? 'Salvar Alterações' : 'Criar Pop-up'}
          </button>
        </div>
      </div>
    </form>
  );
}
