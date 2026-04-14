import { useMemo, useState } from 'react';
import { Product } from './db';

export type SortKey =
  | 'name'
  | 'category'
  | 'stock-asc'
  | 'stock-desc'
  | 'price-asc'
  | 'price-desc';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name (A–Z)' },
  { key: 'category', label: 'Category (A–Z)' },
  { key: 'stock-asc', label: 'Stock: Low first' },
  { key: 'stock-desc', label: 'Stock: High first' },
  { key: 'price-asc', label: 'Price: Low first' },
  { key: 'price-desc', label: 'Price: High first' },
];

export function useProductSort(products: Product[] | undefined) {
  const [sort, setSort] = useState<SortKey>('name');

  const sorted = useMemo(() => {
    const list = [...(products ?? [])];
    switch (sort) {
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'category':
        return list.sort(
          (a, b) =>
            a.category.localeCompare(b.category) ||
            a.name.localeCompare(b.name),
        );
      case 'stock-asc':
        return list.sort((a, b) => a.stock - b.stock);
      case 'stock-desc':
        return list.sort((a, b) => b.stock - a.stock);
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
    }
  }, [products, sort]);

  return { sort, setSort, sorted };
}
