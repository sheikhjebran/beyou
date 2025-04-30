
'use server'; // Required for server-side actions

import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, serverTimestamp, FirestoreError, query, orderBy, limit, Timestamp, getDoc } from 'firebase/firestore'; // Import FirestoreError, query, orderBy, limit, Timestamp, getDoc
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Product } from '@/types/product';
import { getMainCategories, getSubCategories, type Category } from '@/lib/categories'; // Import category helpers

// Default placeholder image URL
const DEFAULT_IMAGE_URL = 'https://picsum.photos/seed/productplaceholder/400/300';

// Type for adding a new product (omits id, includes File for image)
// Now includes category and subCategory
export type AddProductData = Omit<Product, 'id' | 'imageUrl' | 'createdAt' | 'updatedAt'> & { // Exclude timestamps
    imageFile?: File | null;
};

// Type for updating an existing product (optional fields, includes File for image)
// Now includes optional category and subCategory
export type UpdateProductData = Partial<Omit<Product, 'id' | 'imageUrl' | 'createdAt' | 'updatedAt'>> & { // Exclude timestamps
    imageFile?: File | null;
};

// Helper to convert Firestore Timestamp to a serializable format (ISO string)
// Returns null if the timestamp is invalid or missing
const serializeTimestamp = (timestamp: unknown): string | null => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  // Handle cases where timestamp might already be a string or number (e.g., from previous storage)
  if (typeof timestamp === 'string') {
     // Could add validation here if needed
     return timestamp;
  }
  if (typeof timestamp === 'number') {
      return new Date(timestamp).toISOString();
  }
  return null;
};


/**
 * Fetches all products from the Firestore 'products' collection.
 * Returns only serializable fields suitable for client components.
 * Products are sorted by name by default.
 * @returns Promise<Product[]> An array of products.
 */
export async function getProducts(): Promise<Product[]> {
    try {
        console.log("Attempting to fetch products from Firestore...");
        const productsCollection = collection(db, 'products');
        // Optional: Add sorting if needed for the main list, e.g., orderBy('name', 'asc')
        const q = query(productsCollection, orderBy('name', 'asc'));
        const productSnapshot = await getDocs(q); // Use the query 'q' here

        // Map documents to Product type, ensuring serializable fields
        const productList = productSnapshot.docs.map(doc => {
             const data = doc.data();
             // Ensure only fields defined in the Product type are included
             const product: Product = {
                id: doc.id,
                name: data.name,
                type: data.type ?? 'Beauty', // Provide default if missing
                category: data.category ?? 'Other', // Provide default if missing
                subCategory: data.subCategory ?? 'Miscellaneous', // Provide default if missing
                description: data.description,
                price: data.price,
                imageUrl: data.imageUrl || DEFAULT_IMAGE_URL, // Use default if imageUrl is missing
                quantity: data.quantity,
                // Timestamps are NOT included here to avoid serialization issues for client components
                // createdAt: serializeTimestamp(data.createdAt),
                // updatedAt: serializeTimestamp(data.updatedAt),
            };
            return product;
        });

        console.log(`Successfully fetched ${productList.length} products.`);
        return productList;
    } catch (error) {
        console.error("Error fetching products from Firestore: ", error);
        // Provide more specific feedback based on the error type if possible
        if (error instanceof FirestoreError) {
            // Common Firestore errors: 'permission-denied', 'unavailable', 'unauthenticated', 'failed-precondition'
            console.error(`Firestore Error Code: ${error.code}`);
             if (error.code === 'permission-denied') {
                 throw new Error("Permission denied when fetching products. Check Firestore security rules.");
             } else if (error.code === 'unauthenticated') {
                 throw new Error("User is unauthenticated. Cannot fetch products.");
             } else if (error.code === 'unavailable') {
                throw new Error("Firestore is currently unavailable. Please try again later.");
             } else if (error.code === 'failed-precondition' && error.message.includes('index')) {
                 // Suggest creating the index
                 const indexCreationMessage = `Firestore index required for sorting/filtering products. Please create the necessary index in your Firebase console. Error: ${error.message}`;
                 console.error(indexCreationMessage);
                 throw new Error("Database index required for sorting/filtering. Please check server logs or Firebase console to create the required index.");
             }
            throw new Error(`Failed to fetch products due to Firestore error: ${error.message}`);
        }
        // Fallback for generic errors
        throw new Error(`Failed to fetch products. Original error: ${error instanceof Error ? error.message : String(error)}`);
    }
}


/**
 * Fetches the most recently added or updated product from Firestore.
 * Uses the 'updatedAt' timestamp primarily, falling back to 'createdAt'.
 * Requires a composite index: products(updatedAt DESC, createdAt DESC).
 * @returns Promise<Product | null> The most recent product or null if none exist or on error.
 */
export async function getMostRecentProduct(): Promise<Product | null> {
    try {
        console.log("Attempting to fetch the most recent product...");
        const productsCollection = collection(db, 'products');

        // Query for the latest product based on 'updatedAt', then 'createdAt'
        // Firestore requires an index for queries involving multiple orderBy clauses
        // or orderBy on one field and limit on another. Ensure this index exists:
        // Collection: products, Fields: updatedAt DESC, createdAt DESC
        const q = query(
            productsCollection,
            orderBy('updatedAt', 'desc'), // Order by most recent update first
            orderBy('createdAt', 'desc'), // Then by most recent creation
            limit(1) // Get only the top one
        );

        const productSnapshot = await getDocs(q);

        if (productSnapshot.empty) {
            console.log("No products found.");
            return null;
        }

        const doc = productSnapshot.docs[0];
        const data = doc.data();

        // Map to Product type, ensuring serializable fields
        const recentProduct: Product = {
            id: doc.id,
            name: data.name,
            type: data.type ?? 'Beauty', // Provide default if missing
            category: data.category ?? 'Other', // Provide default if missing
            subCategory: data.subCategory ?? 'Miscellaneous', // Provide default if missing
            description: data.description,
            price: data.price,
            imageUrl: data.imageUrl || DEFAULT_IMAGE_URL,
            quantity: data.quantity,
            // Include serialized timestamps if needed for display, otherwise omit
            // createdAt: serializeTimestamp(data.createdAt),
            // updatedAt: serializeTimestamp(data.updatedAt),
        };

        console.log("Successfully fetched the most recent product:", recentProduct.id);
        return recentProduct;

    } catch (error) {
        console.error("Error fetching the most recent product: ", error);
        if (error instanceof FirestoreError) {
            console.error(`Firestore Error Code: ${error.code}`);
            if (error.code === 'permission-denied') {
                 console.error("Permission denied when fetching recent product. Check Firestore security rules.");
                 // Return null for dashboard resilience
                 return null;
             } else if (error.code === 'unauthenticated') {
                 console.error("User is unauthenticated. Cannot fetch recent product.");
                 return null;
             } else if (error.code === 'failed-precondition' && error.message.includes('index')) {
                 // Provide clearer guidance to create the index
                 const indexCreationMessage = `
##############################################################################
# ACTION REQUIRED: Firestore Index Missing                                   #
##############################################################################
#
# The query to fetch the most recent product requires a Firestore index.
# Please create this index in your Firebase Console for the 'products' collection.
#
# Required Index Fields:
# 1. updatedAt (Descending)
# 2. createdAt (Descending)
#
# You can often create this index directly using the link provided in the
# original Firebase error message (check your server logs or browser console).
#
# Example Error Link from Firebase:
# ${error.message.match(/https?:\/\/[^\s]+/)?.[0] || 'See Firebase Console logs for the creation link.'}
#
# Once the index is built (this may take a few minutes), this feature
# should work correctly. The application will show 'N/A' until then.
#
##############################################################################
`;
                 console.error(indexCreationMessage);
                 // Return null to allow the rest of the dashboard to load gracefully
                 return null;
             } else {
                 console.error(`Failed to fetch recent product due to Firestore error: ${error.message}`);
                 return null;
             }
        }
        // Fallback for generic errors - also return null for dashboard resilience
        console.error(`Failed to fetch recent product. Original error: ${error instanceof Error ? error.message : String(error)}`);
        return null;
    }
}

/**
 * Fetches a single product by its ID from Firestore.
 * Returns only serializable fields suitable for client components.
 * @param productId The ID of the product to fetch.
 * @returns Promise<Product | null> The product or null if not found.
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    console.log(`Attempting to fetch product with ID: ${productId}...`);
    const productDocRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productDocRef);

    if (!productDoc.exists()) {
      console.log(`Product with ID ${productId} not found.`);
      return null;
    }

    const data = productDoc.data();
    const product: Product = {
      id: productDoc.id,
      name: data.name,
      type: data.type ?? 'Beauty', // Provide default if missing
      category: data.category ?? 'Other', // Provide default if missing
      subCategory: data.subCategory ?? 'Miscellaneous', // Provide default if missing
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl || DEFAULT_IMAGE_URL,
      quantity: data.quantity,
      // Timestamps are NOT included here
    };

    console.log(`Successfully fetched product: ${productId}`);
    return product;
  } catch (error) {
    console.error(`Error fetching product with ID ${productId}: `, error);
    if (error instanceof FirestoreError) {
      console.error(`Firestore Error Code: ${error.code}`);
      if (error.code === 'permission-denied') {
        throw new Error(`Permission denied when fetching product ${productId}. Check Firestore security rules.`);
      } else if (error.code === 'unauthenticated') {
        throw new Error(`User is unauthenticated. Cannot fetch product ${productId}.`);
      }
      throw new Error(`Failed to fetch product ${productId} due to Firestore error: ${error.message}`);
    }
    // Fallback for generic errors
    throw new Error(`Failed to fetch product ${productId}. Original error: ${error instanceof Error ? error.message : String(error)}`);
  }
}


/**
 * Uploads an image file to Firebase Storage.
 * @param file The image file to upload.
 * @returns Promise<string> The download URL of the uploaded image.
 * @throws Throws an error if upload fails.
 */
async function uploadImage(file: File): Promise<string> {
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('File available at', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image: ", error);
        // Add more details if storage error
        if (error instanceof Error && 'code' in error) {
             const storageErrorCode = (error as any).code; // Firebase storage errors often have a code property
             console.error(`Firebase Storage Error Code: ${storageErrorCode}`);
             if (storageErrorCode === 'storage/unauthorized') {
                 throw new Error("Permission denied for image upload. Check Storage security rules.");
             }
             throw new Error(`Image upload failed due to Storage error: ${storageErrorCode}`);
        }
        throw new Error("Image upload failed.");
    }
}

/**
 * Adds a new product to the Firestore 'products' collection.
 * Uploads an image if provided, otherwise uses a default image.
 * Includes 'createdAt' and 'updatedAt' timestamps.
 * Includes category and subCategory.
 * @param productData The data for the new product, including an optional image file.
 * @returns Promise<string> The ID of the newly added product document.
 */
export async function addProduct(productData: AddProductData): Promise<string> {
    let imageUrl = DEFAULT_IMAGE_URL;

    // Validate category and subCategory
    const validCategories = getMainCategories();
    if (!validCategories.includes(productData.category as any)) {
        throw new Error(`Invalid category provided: ${productData.category}`);
    }
    const validSubCategories = getSubCategories(productData.category as any);
    if (!validSubCategories.includes(productData.subCategory as any)) {
        throw new Error(`Invalid subCategory "${productData.subCategory}" for category "${productData.category}"`);
    }


    // Upload image if provided
    if (productData.imageFile) {
        try {
            imageUrl = await uploadImage(productData.imageFile);
        } catch (error) {
            console.error("Image upload failed, using default image.", error);
            // Re-throw the specific upload error to inform the user
            if (error instanceof Error) throw error;
            throw new Error("Image upload failed unexpectedly.");
        }
    }

    const { imageFile, ...dataToSave } = productData; // Exclude imageFile from Firestore data
    const now = serverTimestamp(); // Get the server timestamp

    try {
        const productsCollection = collection(db, 'products');
        const docRef = await addDoc(productsCollection, {
            ...dataToSave,
            imageUrl: imageUrl, // Add the final image URL
            createdAt: now, // Add creation timestamp
            updatedAt: now, // Initialize update timestamp
        });
        console.log("Product added with ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error adding product to Firestore: ", error);
         if (error instanceof FirestoreError) {
            console.error(`Firestore Error Code: ${error.code}`);
            if (error.code === 'permission-denied') {
                 throw new Error("Permission denied when adding product. Check Firestore security rules.");
             } else if (error.code === 'unauthenticated') {
                 throw new Error("User is unauthenticated. Cannot add product.");
             }
            throw new Error(`Failed to add product due to Firestore error: ${error.message}`);
        }
        // Fallback for generic errors
        throw new Error(`Failed to add product. Original error: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Updates an existing product in the Firestore 'products' collection.
 * Optionally uploads a new image if provided.
 * Updates the 'updatedAt' timestamp.
 * Validates category and subCategory if they are being updated.
 * @param productId The ID of the product to update.
 * @param productData The data to update, including an optional new image file.
 * @returns Promise<void>
 */
export async function updateProduct(productId: string, productData: UpdateProductData): Promise<void> {
     let imageUrl: string | undefined = undefined;

     // Validate category/subCategory if they are part of the update
     if (productData.category !== undefined) {
        const validCategories = getMainCategories();
        if (!validCategories.includes(productData.category as any)) {
            throw new Error(`Invalid category provided for update: ${productData.category}`);
        }
         // If category is updated, subCategory MUST also be provided and valid for the NEW category
         if (productData.subCategory !== undefined) {
             const validSubCategories = getSubCategories(productData.category as any);
             if (!validSubCategories.includes(productData.subCategory as any)) {
                throw new Error(`Invalid subCategory "${productData.subCategory}" for updated category "${productData.category}"`);
             }
         } else {
             // Fetch current product to check its subCategory if only category is changing
             // This scenario might need more specific handling depending on requirements
             // For now, we'll assume if category changes, subCategory should be specified
             console.warn("Updating category without explicitly setting subCategory. Ensure the new subCategory is provided if needed.");
             // Alternatively, throw an error:
             // throw new Error("When updating category, a valid subCategory for the new category must also be provided.");
         }
     } else if (productData.subCategory !== undefined) {
         // If only subCategory is updated, validate it against the *current* category
         const currentProduct = await getProductById(productId);
         if (!currentProduct) {
             throw new Error(`Product with ID ${productId} not found for subCategory validation.`);
         }
         const validSubCategories = getSubCategories(currentProduct.category as any);
         if (!validSubCategories.includes(productData.subCategory as any)) {
             throw new Error(`Invalid subCategory "${productData.subCategory}" for current category "${currentProduct.category}"`);
         }
     }


    // Upload new image if provided
     if (productData.imageFile) {
        try {
            imageUrl = await uploadImage(productData.imageFile);
        } catch (error) {
            console.error("New image upload failed during update.", error);
            if (error instanceof Error) throw error; // Re-throw specific upload error
            throw new Error("New image upload failed unexpectedly during update.");
         }
    }

     const { imageFile, ...dataToUpdate } = productData; // Exclude imageFile from Firestore data

     // Add the new image URL to the update data if it was uploaded
     if (imageUrl !== undefined) {
        (dataToUpdate as Partial<Product>).imageUrl = imageUrl;
     }

     // Remove fields with undefined values, as Firestore doesn't allow them directly in updates
     Object.keys(dataToUpdate).forEach(key => {
         const typedKey = key as keyof typeof dataToUpdate;
         if (dataToUpdate[typedKey] === undefined) {
             delete dataToUpdate[typedKey];
         }
     });


     if (Object.keys(dataToUpdate).length === 0 && !imageUrl) { // Check if only image was potentially updated
        console.log("No data provided for update (excluding image file).");
         return; // Nothing to update
     }


    try {
        const productDoc = doc(db, 'products', productId);
        await updateDoc(productDoc, {
             ...dataToUpdate,
             updatedAt: serverTimestamp(), // Update the timestamp
        });
        console.log("Product updated with ID: ", productId);
    } catch (error) {
        console.error("Error updating product in Firestore: ", error);
         if (error instanceof FirestoreError) {
            console.error(`Firestore Error Code: ${error.code}`);
            if (error.code === 'permission-denied') {
                 throw new Error("Permission denied when updating product. Check Firestore security rules.");
             } else if (error.code === 'unauthenticated') {
                 throw new Error("User is unauthenticated. Cannot update product.");
             }
            throw new Error(`Failed to update product due to Firestore error: ${error.message}`);
        }
        // Fallback for generic errors
        throw new Error(`Failed to update product. Original error: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Placeholder for deleteProduct function if needed in the future
// import { deleteDoc } from 'firebase/firestore';
// export async function deleteProduct(productId: string): Promise<void> {
//     try {
//         const productDoc = doc(db, 'products', productId);
//         await deleteDoc(productDoc);
//         console.log("Product deleted with ID: ", productId);
//         // Optionally delete the associated image from storage here
//     } catch (error) {
//         console.error("Error deleting product: ", error);
//         throw new Error("Failed to delete product.");
//     }
// }


