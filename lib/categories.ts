import type { Category } from '@/types/database';

export const categoryLabel = (name: string) => name.split(' / ').at(-1) || name;

export function categoryPath(category: Category, categories: Category[]): string {
  const slugs = [category.slug];
  const visited = new Set([category.id]);
  let parent = categories.find(c => c.id === category.parent_id);
  while (parent && !visited.has(parent.id)) {
    slugs.unshift(parent.slug);
    visited.add(parent.id);
    parent = categories.find(c => c.id === parent!.parent_id);
  }
  return `/categoria/${slugs.join('/')}`;
}

export function categoryNames(category: Category, categories: Category[]): string[] {
  const ids = new Set([category.id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const item of categories) {
      if (item.parent_id && ids.has(item.parent_id) && !ids.has(item.id)) {
        ids.add(item.id);
        changed = true;
      }
    }
  }
  return categories.filter(c => ids.has(c.id)).map(c => c.name);
}
