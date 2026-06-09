import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = 'ARS'): string {
  if (currency === 'ARS') {
    return `$ ${price.toLocaleString('es-AR')}`;
  }
  if (currency === 'USD') {
    return `US$ ${price.toLocaleString('en-US')}`;
  }
  return `$ ${price.toLocaleString('es-AR')}`;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getInitials(name: string, lastName?: string): string {
  const first = name.charAt(0).toUpperCase();
  const second = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${second}`;
}

export function cnFormat(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
