

// Firebase client SDK operations are typically client-side.
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, serverTimestamp, FirestoreError, query, orderBy, limit, Timestamp, getDoc, deleteDoc, runTransaction, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Product } from '@/types/product';
import { getMainCategories, getSubCategories, type Category } from '@/lib/categories';

// Default placeholder image URL
const DEFAULT_PRIMARY_IMAGE_URL = 'https://placehold.co/400x300.png';
const FIREBASE_STORAGE_DOMAIN = 'elegance-boutique-m9ypf.firebasestorage.app';


// Type for adding a new product
export type AddProductData = Omit<Product, 'id' | 'primaryImageUrl' | 'imageUrls' | 'createdAt' | 'updatedAt'> & {
    imageFiles?: File[] | null;
    primaryImageIndex?: number; // Index of the primary image within imageFiles
};

// Type for updating an existing product
export type UpdateProductData = Partial<Omit<Product, 'id' | 'primaryImageUrl' | 'imageUrls' | 'createdAt' | 'updatedAt'>> & {
    imageFiles?: File[] | null; // Array of files for replacement, or null to remove all
    newPrimaryImageIndexForUpload?: number; // If imageFiles are provided, this is the index for the primary
    makeExistingImagePrimary?: string;    // If no imageFiles, this URL from existing images becomes primary
};

// Type for a sale record
export type SaleRecord = {
  id?: string; // Firestore document ID
  productId: string;
  productName: string;
  quantitySold: number;
  salePricePerUnit: number; // Price per unit at the time of sale
  totalSaleAmount: number; // quantitySold * salePricePerUnit
  saleTimestamp: Timestamp; // Firestore Timestamp
};

// Type for today's sales summary
export type TodaysSalesSummary = {
  ordersToday: number;
  salesTodayAmount: number;
};

// Type for product sales summary (for analytics)
export type ProductSaleSummary = {
  productId: string;
  productName: string;
  totalQuantitySold: number;
};

// Type for top sales by quantity in a single order
export type TopSaleByQuantity = {
  id: string; // Sale document ID
  productName: string;
  quantitySold: number;
  saleDate: string; // Formatted sale date
};


const serializeTimestamp = (timestamp: unknown): string | null => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (typeof timestamp === 'string') {
     // Assuming it's already an ISO string
     return timestamp;
  }
  if (typeof timestamp === 'number') {
      // Assuming it's a Unix timestamp in milliseconds
      return new Date(timestamp).toISOString();
  }
  return null;
};

async function deleteImageFromStorage(imageUrl: string | undefined | null): Promise<void> {
  if (!imageUrl || imageUrl === DEFAULT_PRIMARY_IMAGE_URL || !imageUrl.includes(FIREBASE_STORAGE_DOMAIN)) {
    return;
  }
  try {
    const url = new URL(imageUrl);
    const pathName = url.pathname;
    const prefix = `/v0/b/${FIREBASE_STORAGE_DOMAIN}/o/`;
    if (pathName.startsWith(prefix)) {
        let filePath = pathName.substring(prefix.length);
        filePath = filePath.split('?')[0];
        if (filePath) {
            const imageRef = ref(storage, decodeURIComponent(filePath));
            await deleteObject(imageRef);
        }
    }
  } catch (error) {
    const storageErrorCode = (error as any)?.code;
    if (storageErrorCode === 'storage/object-not-found') {
      console.warn(`Image not found in storage (may have already been deleted): ${imageUrl}`);
    } else {
      console.warn(`Error deleting image ${imageUrl} from storage:`, error);
    }
  }
}


export async function getProducts(): Promise<Product[]> {
    try {
        const productsCollection = collection(db, 'products');
        const q = query(productsCollection, orderBy('updatedAt', 'desc'));
        const productSnapshot = await getDocs(q);

        const productList = productSnapshot.docs.map(doc => {
             const data = doc.data();
             const product: Product = {
                id: doc.id,
                name: data.name || 'Unnamed Product',
                category: data.category ?? 'Other',
                subCategory: data.subCategory ?? 'Miscellaneous',
                description: data.description || 'No description available.',
                price: typeof data.price === 'number' ? data.price : 0,
                primaryImageUrl: data.primaryImageUrl || DEFAULT_PRIMARY_IMAGE_URL,
                imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
                quantity: Number(data.quantity) || 0,
                isBestSeller: data.isBestSeller || false,
                createdAt: serializeTimestamp(data.createdAt),
                updatedAt: serializeTimestamp(data.updatedAt),
            };
            return product;
        });

        return productList;
    } catch (error) {
        console.warn("Warning during fetching products from Firestore: ", error);
        if (error instanceof FirestoreError) {
            console.warn(`Firestore Error Code: ${error.code}`);
             if (error.code === 'failed-precondition' && error.message.includes('index')) {
                console.warn(`ACTION REQUIRED/INFO: Firestore Index Issue for getProducts query. An index on 'updatedAt' (DESC) is required. Error: ${error.message}. Returning empty list.`);
             } else if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
                 console.warn(`Permission issue: ${error.message}. Returning empty list.`);
             } else {
                console.warn(`Failed to fetch products due to Firestore error: ${error.message}. Returning empty list.`);
             }
        } else {
            console.warn(`Failed to fetch products. Original error: ${error instanceof Error ? error.message : String(error)}. Returning empty list.`);
        }
        return [];
    }
}

export async function getBestSellingProducts(): Promise<Product[]> {
    try {
        const productsCollection = collection(db, 'products');
        const q = query(
            productsCollection,
            where('isBestSeller', '==', true),
            orderBy('updatedAt', 'desc')
        );
        const productSnapshot = await getDocs(q);

        const productList = productSnapshot.docs.map(doc => {
            const data = doc.data();
            const product: Product = {
                id: doc.id,
                name: data.name || 'Unnamed Product',
                category: data.category ?? 'Other',
                subCategory: data.subCategory ?? 'Miscellaneous',
                description: data.description || 'No description available.',
                price: typeof data.price === 'number' ? data.price : 0,
                primaryImageUrl: data.primaryImageUrl || DEFAULT_PRIMARY_IMAGE_URL,
                imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
                quantity: Number(data.quantity) || 0,
                isBestSeller: true, // We know this is true from the query
                createdAt: serializeTimestamp(data.createdAt),
                updatedAt: serializeTimestamp(data.updatedAt),
            };
            return product;
        });

        return productList;
    } catch (error) {
        console.warn("Warning during fetching best selling products: ", error);
        if (error instanceof FirestoreError) {
            console.warn(`Firestore Error Code: ${error.code}`);
            if (error.code === 'failed-precondition' && error.message.includes('index')) {
                console.warn(`ACTION REQUIRED/INFO: Firestore Index Issue for getBestSellingProducts. An index on 'isBestSeller' (==) and 'updatedAt' (DESC) is required. Error: ${error.message}. Returning empty list.`);
            } else {
                console.warn(`Failed to fetch best selling products due to Firestore error: ${error.message}. Returning empty list.`);
            }
        } else {
            console.warn(`Failed to fetch best selling products. Original error: ${error instanceof Error ? error.message : String(error)}. Returning empty list.`);
        }
        return [];
    }
}


export async function getMostRecentProduct(): Promise<Product | null> {
    try {
        const productsCollection = collection(db, 'products');
        const q = query(
            productsCollection,
            orderBy('updatedAt', 'desc'),
            orderBy('createdAt', 'desc'),
            limit(1)
        );
        const productSnapshot = await getDocs(q);
        if (productSnapshot.empty) return null;

        const doc = productSnapshot.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name || 'Unnamed Product',
            category: data.category ?? 'Other',
            subCategory: data.subCategory ?? 'Miscellaneous',
            description: data.description || 'No description',
            price: typeof data.price === 'number' ? data.price : 0,
            primaryImageUrl: data.primaryImageUrl || DEFAULT_PRIMARY_IMAGE_URL,
            imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
            quantity: Number(data.quantity) || 0,
            isBestSeller: data.isBestSeller || false,
            createdAt: serializeTimestamp(data.createdAt),
            updatedAt: serializeTimestamp(data.updatedAt),
        };
    } catch (error) {
        console.warn("Warning during fetching the most recent product: ", error);
        if (error instanceof FirestoreError) {
            console.warn(`Firestore Error Code: ${error.code}`);
             if (error.code === 'failed-precondition' && error.message.includes('index')) {
                 const indexCreationMessage = `ACTION REQUIRED/INFO: Firestore Index Issue for Recent Products Query. Fields: updatedAt (DESC), createdAt (DESC). Status: ${error.message.includes('currently building') ? 'BUILDING' : 'MISSING/MISCONFIGURED'}. Error: ${error.message}. Returning null.`;
                 console.warn(indexCreationMessage);
             } else {
                 console.warn(`Failed to fetch recent product due to Firestore error: ${error.message}. Returning null.`);
             }
        } else {
          console.warn(`Failed to fetch recent product. Original error: ${error instanceof Error ? error.message : String(error)}. Returning null.`);
        }
        return null;
    }
}

export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const productDocRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productDocRef);
    if (!productDoc.exists()) return null;

    const data = productDoc.data();
    return {
      id: productDoc.id,
      name: data.name || 'Unnamed Product',
      category: data.category ?? 'Other',
      subCategory: data.subCategory ?? 'Miscellaneous',
      description: data.description || 'No description',
      price: typeof data.price === 'number' ? data.price : 0,
      primaryImageUrl: data.primaryImageUrl || DEFAULT_PRIMARY_IMAGE_URL,
      imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
      quantity: Number(data.quantity) || 0,
      isBestSeller: data.isBestSeller || false,
      createdAt: serializeTimestamp(data.createdAt),
      updatedAt: serializeTimestamp(data.updatedAt),
    };
  } catch (error) {
    console.warn(`Warning during fetching product with ID ${productId}: `, error);
    if (error instanceof FirestoreError) {
      console.warn(`Firestore Error Code: ${error.code}`);
    } else {
      console.warn(`Failed to fetch product ${productId}. Original error: ${error instanceof Error ? error.message : String(error)}.`);
    }
    return null;
  }
}

async function uploadImage(file: File, productId?: string): Promise<string> {
    const uniqueFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const storagePath = productId ? `products/${productId}/${uniqueFileName}` : `products/temp/${uniqueFileName}`;
    const storageRef = ref(storage, storagePath);
    try {
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
    } catch (error) {
        console.error("Error uploading image: ", error);
        if (error instanceof Error && 'code' in error) {
             const storageErrorCode = (error as any).code;
             console.error(`Firebase Storage Error Code: ${storageErrorCode}`);
             if (storageErrorCode === 'storage/unauthorized' || storageErrorCode === 'storage/unauthenticated') {
                 throw new Error("Permission denied for image upload. Please ensure you are logged in and check Firebase Storage security rules to allow writes to the 'products/' path for authenticated users.");
             }
             throw new Error(`Image upload failed due to Storage error: ${storageErrorCode}`);
        }
        throw new Error("Image upload failed.");
    }
}

export async function addProduct(productData: AddProductData): Promise<string> {
    let uploadedImageUrls: string[] = [];
    let primaryImgUrl = DEFAULT_PRIMARY_IMAGE_URL;

    const validCategories = getMainCategories();
    if (!validCategories.includes(productData.category as any)) {
        throw new Error(`Invalid category provided: ${productData.category}`);
    }
    const validSubCategories = getSubCategories(productData.category as any);
    if (productData.subCategory && !validSubCategories.includes(productData.subCategory as any)) {
        throw new Error(`Invalid subCategory "${productData.subCategory}" for category "${productData.category}"`);
    }


    if (productData.imageFiles && productData.imageFiles.length > 0) {
        try {
            for (const file of productData.imageFiles) {
                const url = await uploadImage(file); // Temp upload path initially
                uploadedImageUrls.push(url);
            }
            if (uploadedImageUrls.length > 0) {
                const pIndex = productData.primaryImageIndex ?? 0;
                if (pIndex >= 0 && pIndex < uploadedImageUrls.length) {
                    primaryImgUrl = uploadedImageUrls[pIndex];
                    // Ensure primary is first in the array
                    const otherImageUrls = uploadedImageUrls.filter((_, i) => i !== pIndex);
                    uploadedImageUrls = [primaryImgUrl, ...otherImageUrls];
                } else { 
                    primaryImgUrl = uploadedImageUrls[0];
                }
            }
        } catch (error) {
            console.error("One or more image uploads failed:", error);
            // Cleanup already uploaded temp images if any error
            for (const url of uploadedImageUrls) await deleteImageFromStorage(url);
            if (error instanceof Error) throw error; // Re-throw the specific upload error
            throw new Error("Image upload process failed.");
        }
    } else {
        throw new Error("At least one image is required to add a product.");
    }

    const { imageFiles, primaryImageIndex, ...dataToSave } = productData;
    const now = serverTimestamp();
    let docId = '';

    try {
        const productsCollection = collection(db, 'products');
        const docRef = await addDoc(productsCollection, {
            ...dataToSave,
            primaryImageUrl: primaryImgUrl, // Will be updated if images were temp
            imageUrls: uploadedImageUrls, // Will be updated if images were temp
            isBestSeller: false, // Default to false on creation
            createdAt: now,
            updatedAt: now,
        });
        docId = docRef.id;

        // If images were uploaded to a temp path, move/rename them to the final path with productId
        // For simplicity, this example re-uploads. A real scenario might use move/copy operations if available or re-upload.
        // Here, we assume the current uploadedImageUrls and primaryImgUrl are used as is.

        return docId;
    } catch (error) {
        console.error("Error adding product to Firestore: ", error);
         // If Firestore fails, try to delete any images that were uploaded
        for (const url of uploadedImageUrls) await deleteImageFromStorage(url);

         if (error instanceof FirestoreError) {
            console.error(`Firestore Error Code: ${error.code}`);
            if (error.code === 'permission-denied') {
                 throw new Error("Permission denied when adding product. Check Firestore security rules and ensure you are logged in.");
             } else if (error.code === 'unauthenticated') {
                 throw new Error("User is unauthenticated. Cannot add product.");
             }
            throw new Error(`Failed to add product to Firestore due to error: ${error.message}`);
        }
        const originalErrorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to add product. Original error: ${originalErrorMessage}`);
    }
}

export async function updateProduct(productId: string, productData: UpdateProductData): Promise<void> {
    const currentProduct = await getProductById(productId);
    if (!currentProduct) {
        throw new Error(`Product with ID ${productId} not found for update.`);
    }

    const dataToUpdate: { [key: string]: any } = {};
    let hasChanges = false;

    // Check for changes in standard fields by comparing with currentProduct
    (Object.keys(productData) as Array<keyof UpdateProductData>).forEach(key => {
        if (key !== 'imageFiles' && key !== 'newPrimaryImageIndexForUpload' && key !== 'makeExistingImagePrimary') {
            const formValue = productData[key];
            const productValue = (currentProduct as any)[key];
            // Explicitly check boolean `isBestSeller`
            if (key === 'isBestSeller') {
                if (formValue !== (productValue || false)) {
                    dataToUpdate[key] = formValue;
                    hasChanges = true;
                }
            } else if (formValue !== undefined && formValue !== productValue) {
                dataToUpdate[key] = formValue;
                hasChanges = true;
            }
        }
    });

    const finalCategory = dataToUpdate.category || currentProduct.category;
    if (finalCategory === 'Custom Prints' && (dataToUpdate.subCategory !== undefined || currentProduct.subCategory)) {
        if (currentProduct.subCategory) { // Only mark as change if it was previously set
             dataToUpdate.subCategory = ''; 
             hasChanges = true;
        }
    } else if (dataToUpdate.category !== undefined) { // if category changed, re-validate subCategory
        const validSubCategories = getSubCategories(finalCategory as Category);
        const finalSubCategory = dataToUpdate.subCategory === undefined ? currentProduct.subCategory : dataToUpdate.subCategory;
        if (finalCategory !== 'Custom Prints' && (!finalSubCategory || !validSubCategories.includes(finalSubCategory as any))) {
             throw new Error(`Invalid subCategory "${finalSubCategory}" for category "${finalCategory}"`);
        }
    } else if (dataToUpdate.subCategory !== undefined) { // only subCategory changed
        const validSubCategories = getSubCategories(finalCategory as Category);
         if (finalCategory !== 'Custom Prints' && !validSubCategories.includes(dataToUpdate.subCategory as any)) {
            throw new Error(`Invalid subCategory "${dataToUpdate.subCategory}" for category "${finalCategory}"`);
        }
    }


    let newImageUrlsUploaded: string[] = [];

    if (productData.imageFiles) { // New images were uploaded, replace all
        hasChanges = true;
        // Delete all old images
        for (const oldUrl of currentProduct.imageUrls) await deleteImageFromStorage(oldUrl);
        if (currentProduct.primaryImageUrl !== DEFAULT_PRIMARY_IMAGE_URL && !currentProduct.imageUrls.includes(currentProduct.primaryImageUrl)) {
             await deleteImageFromStorage(currentProduct.primaryImageUrl);
        }

        for (const file of productData.imageFiles) {
            const url = await uploadImage(file, productId);
            newImageUrlsUploaded.push(url);
        }

        if (newImageUrlsUploaded.length > 0) {
            const pIndex = productData.newPrimaryImageIndexForUpload ?? 0;
            dataToUpdate.primaryImageUrl = (pIndex >=0 && pIndex < newImageUrlsUploaded.length) ? newImageUrlsUploaded[pIndex] : newImageUrlsUploaded[0];
            
            const primaryFirstArray = [dataToUpdate.primaryImageUrl];
            newImageUrlsUploaded.forEach(url => {
                if (url !== dataToUpdate.primaryImageUrl) primaryFirstArray.push(url);
            });
            dataToUpdate.imageUrls = primaryFirstArray;
        } else { // Should not happen if form validates min 1 image for new uploads
            dataToUpdate.primaryImageUrl = DEFAULT_PRIMARY_IMAGE_URL;
            dataToUpdate.imageUrls = [];
        }
    } else if (productData.imageFiles === null) { // Explicitly remove all images
        hasChanges = true;
        for (const oldUrl of currentProduct.imageUrls) await deleteImageFromStorage(oldUrl);
         if (currentProduct.primaryImageUrl !== DEFAULT_PRIMARY_IMAGE_URL && !currentProduct.imageUrls.includes(currentProduct.primaryImageUrl)) {
             await deleteImageFromStorage(currentProduct.primaryImageUrl);
        }
        dataToUpdate.primaryImageUrl = DEFAULT_PRIMARY_IMAGE_URL;
        dataToUpdate.imageUrls = [];
    } else if (productData.makeExistingImagePrimary && productData.makeExistingImagePrimary !== currentProduct.primaryImageUrl) {
        hasChanges = true;
        // Reorder existing images
        dataToUpdate.primaryImageUrl = productData.makeExistingImagePrimary;
        const reorderedUrls = [productData.makeExistingImagePrimary];
        currentProduct.imageUrls.forEach(url => {
            if (url !== productData.makeExistingImagePrimary) reorderedUrls.push(url);
        });
        dataToUpdate.imageUrls = reorderedUrls;
    }

    if (!hasChanges) {
        return; // No actual changes to save
    }

    dataToUpdate.updatedAt = serverTimestamp();

    try {
        const productDoc = doc(db, 'products', productId);
        await updateDoc(productDoc, dataToUpdate);
    } catch (error) {
        console.error("Error updating product in Firestore: ", error);
        // If update fails, try to delete newly uploaded images (if any)
        for (const url of newImageUrlsUploaded) await deleteImageFromStorage(url);

         if (error instanceof FirestoreError) {
            console.error(`Firestore Error Code: ${error.code}`);
            if (error.code === 'permission-denied') {
                 throw new Error("Permission denied when updating product. Check Firestore security rules.");
             } else if (error.code === 'unauthenticated') {
                 throw new Error("User is unauthenticated. Cannot update product.");
             }
            throw new Error(`Failed to update product due to Firestore error: ${error.message}`);
        }
        const originalErrorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to update product. Original error: ${originalErrorMessage}`);
    }
}


export async function deleteProduct(productId: string): Promise<void> {
    const productDocRef = doc(db, 'products', productId);
    let productToDelete: Product | null = null;

    try {
        const productDocSnap = await getDoc(productDocRef);
        if (productDocSnap.exists()) {
            const data = productDocSnap.data();
            productToDelete = {
                id: productDocSnap.id,
                name: data.name,
                category: data.category,
                subCategory: data.subCategory,
                description: data.description,
                price: data.price,
                primaryImageUrl: data.primaryImageUrl || DEFAULT_PRIMARY_IMAGE_URL,
                imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
                quantity: data.quantity,
                isBestSeller: data.isBestSeller || false,
                createdAt: serializeTimestamp(data.createdAt),
                updatedAt: serializeTimestamp(data.updatedAt),
            };
        }

        await deleteDoc(productDocRef);

        if (productToDelete) {
            if (productToDelete.imageUrls.length > 0) {
                for (const imageUrl of productToDelete.imageUrls) {
                    await deleteImageFromStorage(imageUrl);
                }
            } else if (productToDelete.primaryImageUrl !== DEFAULT_PRIMARY_IMAGE_URL) { // If no array, check primary
                await deleteImageFromStorage(productToDelete.primaryImageUrl);
            }
        }

    } catch (error) {
        console.error(`Error deleting product ${productId}:`, error);
        if (error instanceof FirestoreError && error.code === 'permission-denied') {
            throw new Error("Permission denied when deleting product from Firestore.");
        }
        if (error instanceof Error && (error as any).code?.startsWith('storage/')) {
            const storageErrorCode = (error as any).code;
             if (storageErrorCode === 'storage/unauthorized' || storageErrorCode === 'storage/unauthenticated') {
               throw new Error("Permission denied when deleting image from Storage.");
            } else if (storageErrorCode === 'storage/object-not-found') {
               console.warn(`Image not found in Storage during deletion for product ${productId}. It may have already been deleted.`);
            } else {
                throw new Error(`Failed to delete product image from Storage due to error: ${storageErrorCode}`);
            }
        }
        const originalErrorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to delete product ${productId}. Original error: ${originalErrorMessage}`);
    }
}

export async function updateProductBestSellerStatus(productId: string, isBestSeller: boolean): Promise<void> {
    const productRef = doc(db, 'products', productId);
    try {
        await updateDoc(productRef, {
            isBestSeller: isBestSeller,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error(`Error updating best seller status for product ${productId}:`, error);
        if (error instanceof FirestoreError) {
            throw new Error(`Failed to update best seller status: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while updating the product.");
    }
}


export async function recordSaleAndUpdateStock(productId: string, quantitySold: number): Promise<void> {
  if (quantitySold <= 0) {
    throw new Error("Quantity sold must be a positive number.");
  }

  const productRef = doc(db, "products", productId);
  const salesCollectionRef = collection(db, "sales");

  try {
    await runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw new Error("Product not found.");
      }

      const productData = productDoc.data();
      const currentQuantity = productData.quantity;
      if (typeof currentQuantity !== 'number') {
        throw new Error("Product quantity data is invalid.");
      }

      if (currentQuantity < quantitySold) {
        throw new Error(`Insufficient stock. Only ${currentQuantity} available.`);
      }

      const newQuantity = currentQuantity - quantitySold;
      transaction.update(productRef, {
        quantity: newQuantity,
        updatedAt: serverTimestamp(),
      });

      const saleData: Omit<SaleRecord, 'id' | 'saleTimestamp'> = {
        productId: productId,
        productName: productData.name || 'Unknown Product',
        quantitySold: quantitySold,
        salePricePerUnit: productData.price || 0,
        totalSaleAmount: (productData.price || 0) * quantitySold,
      };
      transaction.set(doc(salesCollectionRef), {
        ...saleData,
        saleTimestamp: serverTimestamp()
      });
    });
  } catch (error) {
    console.error(`Error recording sale for product ${productId}:`, error);
    if (error instanceof FirestoreError || error instanceof Error) {
      throw new Error(`Failed to record sale: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while recording the sale.");
  }
}


export async function getTodaysSalesSummary(): Promise<TodaysSalesSummary> {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const endOfToday = new Date(today.setHours(23, 59, 59, 999));

  const salesCollectionRef = collection(db, "sales");
  const q = query(
    salesCollectionRef,
    where("saleTimestamp", ">=", Timestamp.fromDate(startOfToday)),
    where("saleTimestamp", "<=", Timestamp.fromDate(endOfToday))
  );

  let ordersToday = 0;
  let salesTodayAmount = 0;

  try {
    const querySnapshot = await getDocs(q);
    ordersToday = querySnapshot.size; 
    querySnapshot.forEach((doc) => {
      const sale = doc.data() as SaleRecord;
      salesTodayAmount += sale.totalSaleAmount || 0;
    });
  } catch (error) {
    console.warn("Warning fetching today's sales summary:", error);
    if (error instanceof FirestoreError && error.code === 'failed-precondition') {
        console.warn(`Firestore index likely required for sales query: ${error.message}. Check 'sales' collection for an index on 'saleTimestamp'.`);
    }
  }
  return { ordersToday, salesTodayAmount };
}

export async function getProductSalesSummary(
  limitCount: number = 10,
  startDate?: Date,
  endDate?: Date
): Promise<ProductSaleSummary[]> {
  const salesCollectionRef = collection(db, "sales");
  let q; 

  const queryConstraints: any[] = [];

  if (startDate) {
    const startTimestamp = Timestamp.fromDate(new Date(startDate.setHours(0, 0, 0, 0)));
    queryConstraints.push(where("saleTimestamp", ">=", startTimestamp));
  }
  if (endDate) {
    const endTimestamp = Timestamp.fromDate(new Date(endDate.setHours(23, 59, 59, 999)));
    queryConstraints.push(where("saleTimestamp", "<=", endTimestamp));
  }
  
  q = query(salesCollectionRef, ...queryConstraints);


  let productSales: Record<string, { name: string, totalQuantity: number }> = {};

  try {
    const salesSnapshot = await getDocs(q);
    salesSnapshot.forEach((docSnap) => {
      const sale = docSnap.data() as SaleRecord;
      if (productSales[sale.productId]) {
        productSales[sale.productId].totalQuantity += sale.quantitySold;
      } else {
        productSales[sale.productId] = {
          name: sale.productName,
          totalQuantity: sale.quantitySold,
        };
      }
    });

    return Object.entries(productSales)
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        totalQuantitySold: data.totalQuantity,
      }))
      .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, limitCount);

  } catch (error) {
    console.warn("Warning fetching product sales summary for analytics:", error);
    if (error instanceof FirestoreError && error.code === 'failed-precondition') {
        console.warn(`Firestore index likely required for sales query with date range (getProductSalesSummary): ${error.message}. Please ensure an index on 'saleTimestamp' exists.`);
    }
    return []; 
  }
}


export async function getTopSalesByQuantity(
  limitCount: number = 10,
  startDate?: Date,
  endDate?: Date
): Promise<TopSaleByQuantity[]> {
  const salesCollectionRef = collection(db, "sales");
  let q;

  const baseQueryConstraints = [
    orderBy("quantitySold", "desc"),
    limit(limitCount),
  ];

  const dateFilters: any[] = [];
  if (startDate) {
    const startTimestamp = Timestamp.fromDate(new Date(startDate.setHours(0, 0, 0, 0)));
    dateFilters.push(where("saleTimestamp", ">=", startTimestamp));
  }
  if (endDate) {
    const endTimestamp = Timestamp.fromDate(new Date(endDate.setHours(23, 59, 59, 999)));
    dateFilters.push(where("saleTimestamp", "<=", endTimestamp));
  }

  q = query(salesCollectionRef, ...dateFilters, ...baseQueryConstraints);

  try {
    const salesSnapshot = await getDocs(q);
    return salesSnapshot.docs.map((docSnap) => {
      const sale = docSnap.data() as SaleRecord;
      return {
        id: docSnap.id,
        productName: sale.productName,
        quantitySold: sale.quantitySold,
        saleDate: sale.saleTimestamp instanceof Timestamp ? sale.saleTimestamp.toDate().toLocaleDateString('en-IN') : 'N/A',
      };
    });
  } catch (error) {
    console.warn("Warning fetching top sales by quantity (getTopSalesByQuantity):", error);
    if (error instanceof FirestoreError && error.code === 'failed-precondition') {
        console.warn(`Firestore index likely required for getTopSalesByQuantity query: ${error.message}. Query involves filtering by 'saleTimestamp' and ordering by 'quantitySold'. Ensure an index on (saleTimestamp ASC/DESC, quantitySold DESC) exists.`);
    }
    return []; 
  }
}
