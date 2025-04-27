'use server'; // Required for server-side actions

import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, serverTimestamp, FirestoreError } from 'firebase/firestore'; // Import FirestoreError
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Product } from '@/types/product';

// Default placeholder image URL
const DEFAULT_IMAGE_URL = 'https://picsum.photos/seed/productplaceholder/400/300';

// Type for adding a new product (omits id, includes File for image)
export type AddProductData = Omit<Product, 'id' | 'imageUrl'> & {
    imageFile?: File | null;
};

// Type for updating an existing product (optional fields, includes File for image)
export type UpdateProductData = Partial<Omit<Product, 'id' | 'imageUrl'>> & {
    imageFile?: File | null;
};


/**
 * Fetches all products from the Firestore 'products' collection.
 * @returns Promise<Product[]> An array of products.
 */
export async function getProducts(): Promise<Product[]> {
    try {
        console.log("Attempting to fetch products from Firestore...");
        const productsCollection = collection(db, 'products');
        const productSnapshot = await getDocs(productsCollection);
        const productList = productSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Product[];
        console.log(`Successfully fetched ${productList.length} products.`);
        return productList;
    } catch (error) {
        console.error("Error fetching products from Firestore: ", error);
        // Provide more specific feedback based on the error type if possible
        if (error instanceof FirestoreError) {
            // Common Firestore errors: 'permission-denied', 'unavailable', 'unauthenticated'
            console.error(`Firestore Error Code: ${error.code}`);
             if (error.code === 'permission-denied') {
                 throw new Error("Permission denied when fetching products. Check Firestore security rules.");
             } else if (error.code === 'unauthenticated') {
                 throw new Error("User is unauthenticated. Cannot fetch products.");
            }
            throw new Error(`Failed to fetch products due to Firestore error: ${error.message}`);
        }
        // Fallback for generic errors
        throw new Error(`Failed to fetch products. Original error: ${error instanceof Error ? error.message : String(error)}`);
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
 * @param productData The data for the new product, including an optional image file.
 * @returns Promise<string> The ID of the newly added product document.
 */
export async function addProduct(productData: AddProductData): Promise<string> {
    let imageUrl = DEFAULT_IMAGE_URL;

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

    try {
        const productsCollection = collection(db, 'products');
        const docRef = await addDoc(productsCollection, {
            ...dataToSave,
            imageUrl: imageUrl, // Add the final image URL
            createdAt: serverTimestamp(), // Optional: Add a timestamp
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
 * @param productId The ID of the product to update.
 * @param productData The data to update, including an optional new image file.
 * @returns Promise<void>
 */
export async function updateProduct(productId: string, productData: UpdateProductData): Promise<void> {
     let imageUrl: string | undefined = undefined;

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
         if (dataToUpdate[key as keyof typeof dataToUpdate] === undefined) {
             delete dataToUpdate[key as keyof typeof dataToUpdate];
         }
     });


     if (Object.keys(dataToUpdate).length === 0) {
        console.log("No data provided for update (excluding image file).");
         return; // Nothing to update
     }


    try {
        const productDoc = doc(db, 'products', productId);
        await updateDoc(productDoc, {
             ...dataToUpdate,
             updatedAt: serverTimestamp(), // Optional: Add an update timestamp
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
