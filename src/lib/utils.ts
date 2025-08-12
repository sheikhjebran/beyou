
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeCategoryNameForId(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/&/g, 'and') // Replace '&' with 'and'
    .replace(/[^a-z0-9-]/g, ''); // Remove any non-alphanumeric (excluding hyphens)
}
