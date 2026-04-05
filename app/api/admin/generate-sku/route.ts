import { NextResponse } from 'next/server';
import { generateSKU } from '@/lib/geminiService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, category } = await request.json();

    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }

    const sku = await generateSKU(name, category);
    
    return NextResponse.json({ sku });
  } catch (error: any) {
    console.error('Error generating SKU:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate SKU' }, { status: 500 });
  }
}
