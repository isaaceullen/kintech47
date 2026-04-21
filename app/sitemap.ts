import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kintech47.vercel.app'; // Replace with actual domain

  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('sku, created_at')
    .eq('is_out_of_stock', false);

  const { data: categories } = await supabase
    .from('categories')
    .select('slug, created_at');

  const productUrls = (products || []).map((product) => ({
    url: `${baseUrl}/${product.sku}`,
    lastModified: new Date(product.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryUrls = (categories || []).map((category) => ({
    url: `${baseUrl}/categoria/${category.slug}`,
    lastModified: new Date(category.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.5,
    },
    ...categoryUrls,
    ...productUrls,
  ];
}
