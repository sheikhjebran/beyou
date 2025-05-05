
/**
 * Defines the structure for product categories and sub-categories.
 * Used to populate selection dropdowns in admin forms and navigation.
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
  'Clothing': [
     'Tops',
     'Bottoms',
     'Dresses',
     'Outerwear',
     'Accessories', // Example sub-categories for Clothing
  ],
  'Photo Prints': [], // Added Photo Prints category
  // Add a generic 'Other' category if needed
  'Other': ['Miscellaneous'],
};

// Type representing the main categories
export type Category = keyof typeof categoryStructure;

// Type representing sub-categories for a given main category T
export type SubCategory<T extends Category> = (typeof categoryStructure)[T][number];

// Helper function to get main categories
export function getMainCategories(): Category[] {
  return Object.keys(categoryStructure) as Category[];
}

// Helper function to get sub-categories for a given main category
export function getSubCategories<T extends Category>(category: T): SubCategory<T>[] {
  // Ensure the category exists in the structure before trying to access its sub-categories
  if (category in categoryStructure) {
    return categoryStructure[category] || [];
  }
  return []; // Return empty array if category doesn't exist
}
