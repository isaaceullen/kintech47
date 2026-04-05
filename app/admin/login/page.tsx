'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { LogIn } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // If Supabase is not configured, we'll simulate a login for the preview
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        if (email === 'admin@admin.com' && password === 'admin') {
          // Simulate login by setting a dummy cookie or just redirecting
          // In a real app, middleware would block this, but we'll just redirect
          document.cookie = "sb-dummy-auth=true; path=/";
          router.push('/admin');
          return;
        } else {
          throw new Error('Credenciais inválidas (Use admin@admin.com / admin para testar)');
        }
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-main p-4">
      <div className="bg-background-secondary p-8 rounded-2xl border border-background-tertiary w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image
            src="https://i.imgur.com/o2m4oj2.png"
            alt="Logo"
            width={180}
            height={60}
            className="h-12 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <h1 className="text-2xl font-bold text-text-main mb-6 text-center">Acesso Restrito</h1>
        
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-support mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
              placeholder="admin@exemplo.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-support mb-1">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background-main border border-background-tertiary rounded-lg text-text-main focus:outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-background-main font-bold py-3 px-4 rounded-lg transition-colors mt-6"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-background-main"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Entrar no Sistema
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-text-support">
            Para testar sem Supabase configurado, use:<br/>
            <span className="font-mono text-accent">admin@admin.com / admin</span>
          </p>
        </div>
      </div>
    </div>
  );
}
