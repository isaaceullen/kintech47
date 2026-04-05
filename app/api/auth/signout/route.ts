import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase.auth.signOut()
    }
  } catch (e) {
    // Ignore if Supabase is not configured
  }

  const response = NextResponse.redirect(new URL('/', request.url), {
    status: 302,
  })
  
  // Clear dummy auth cookie
  response.cookies.delete('sb-dummy-auth')

  return response
}
