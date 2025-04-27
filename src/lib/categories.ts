
/**
 * Defines the structure for product categories and sub-categories.
 * Used to populate selection dropdowns in admin forms.
 * Note: "New Arrivals" and "Best Sellers" are dynamic and not included here.
 */
export const categoryStructure = {
  'K-Beauty': [
    'Lip Gloss',
    'Matte Lipstick',
    'Liquid Matte Lipstick',
    'Lip and Cheek Tint',
    'Water Tint',
    'Highlighters',
    'Liquid Blush',
    'Powder Blush',
  ],
  'Nails': [
    'Press-On Nails',
    'Nail glue',
    'Nail filers',
  ],
  'Brands': [
    // 'Be You by Ayesha Banu', // On hold as per instructions
    'Top Picks - Gloss',
    'Top Picks - Lipstick',
    'Top Picks - Blush',
    'Top Picks - Highlighter',
    'Top Picks - Lip liner',
  ],
  'Exciting Combos': [
    'Value Sets',
    'Limited-Time Offers',
  ],
  // Add 'Clothing' as a top-level category if needed, with its own sub-categories
  'Clothing': [
     'Tops',
     'Bottoms',
     'Dresses',
     'Outerwear',
     'Accessories', // Example sub-categories for Clothing
  ],
  // Add a generic 'Other' category if needed
  'Other': ['Miscellaneous'],
};

export type Category = keyof typeof categoryStructure;
export type SubCategory<T extends Category> = (typeof categoryStructure)[T][number];

// Helper function to get main categories
export function getMainCategories(): Category[] {
  return Object.keys(categoryStructure) as Category[];
}

// Helper function to get sub-categories for a given main category
export function getSubCategories<T extends Category>(category: T): SubCategory<T>[] {
  return categoryStructure[category] || [];
}
