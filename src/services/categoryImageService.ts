
'use client';

import { handleDatabaseResponse } from '@/lib/mysql';
import { normalizeCategoryNameForId } from '@/lib/utils';
import type { CategoryImageData } from '@/types/categoryImage';

// Re-export types for client use
export type { CategoryImageData };

export async function getCategoryImage(categoryName: string): Promise<CategoryImageData | null> {
  if (!categoryName) return null;
  const docId = normalizeCategoryNameForId(categoryName);
  if (!docId) return null;

  try {
    const response = await fetch(`/api/category-images?categoryId=${encodeURIComponent(docId)}`);
    if (response.status === 404) {
      // Return a default "coming soon" image when category image is not found
      return {
        imageUrl: '/coming-soon.png',
        updatedAt: new Date().toISOString()
      };
    }
    return handleDatabaseResponse<CategoryImageData>(response);
  } catch (error) {
    console.error(`Error fetching category image for ${categoryName}:`, error);
    // Also return the default image in case of any error
    return {
      imageUrl: '/coming-soon.png',
      updatedAt: new Date().toISOString()
    };
    return null;
  }
}

export async function updateCategoryImage(categoryName: string, imageFile: File): Promise<void> {
  if (!categoryName) throw new Error("Category name is required.");
  if (!imageFile) throw new Error("Image file is required.");
  
  const docId = normalizeCategoryNameForId(categoryName);
  if (!docId) throw new Error("Invalid category name for ID generation.");

  const formData = new FormData();
  formData.append('categoryId', docId);
  formData.append('imageFile', imageFile);

  const response = await fetch('/api/category-images', {
    method: 'PUT',
    body: formData,
  });

  return handleDatabaseResponse<void>(response);
}

export async function deleteCategoryImage(categoryName: string): Promise<void> {
  if (!categoryName) throw new Error("Category name is required.");
  const docId = normalizeCategoryNameForId(categoryName);
  if (!docId) throw new Error("Invalid category name for ID generation.");

  const response = await fetch(`/api/category-images?categoryId=${encodeURIComponent(docId)}`, {
    method: 'DELETE',
  });

  return handleDatabaseResponse<void>(response);
}
