
import { db, storage, auth } from '@/lib/firebase'; // Added auth
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  FirestoreError,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject as deleteFileFromStorage } from 'firebase/storage';
import { normalizeCategoryNameForId } from '@/lib/utils';

const CATEGORY_IMAGES_COLLECTION = 'categoryImages';
const CATEGORY_IMAGES_STORAGE_PATH = 'category-images';

export interface CategoryImageData {
  imageUrl: string;
  filePath: string;
  updatedAt: Timestamp;
}

// Helper to safely delete a file from storage
async function safeDeleteStorageFile(filePath: string | undefined): Promise<void> {
  if (!filePath) return;
  try {
    const fileRef = ref(storage, filePath);
    await deleteFileFromStorage(fileRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.warn(`Category image file not found in storage (may have already been deleted): ${filePath}`);
    } else {
      console.error(`Error deleting category image file ${filePath} from storage:`, error);
      // Optionally re-throw or handle as critical if needed
    }
  }
}

export async function getCategoryImage(categoryName: string): Promise<CategoryImageData | null> {
  if (!categoryName) return null;
  const docId = normalizeCategoryNameForId(categoryName);
  if (!docId) return null;

  try {
    const docRef = doc(db, CATEGORY_IMAGES_COLLECTION, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as CategoryImageData;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching category image for ${categoryName}:`, error);
    if (error instanceof FirestoreError) {
        console.warn(`Firestore error code: ${error.code} while fetching category image for ${categoryName}`);
    }
    return null; // Return null on error to allow fallback
  }
}

export async function updateCategoryImage(categoryName: string, imageFile: File): Promise<string> {
  if (!categoryName) throw new Error("Category name is required.");
  if (!imageFile) throw new Error("Image file is required.");

  const docId = normalizeCategoryNameForId(categoryName);
  if (!docId) throw new Error("Invalid category name for ID generation.");

  // Fetch existing image data to delete old file from storage
  const existingImageData = await getCategoryImage(categoryName);
  if (existingImageData?.filePath) {
    await safeDeleteStorageFile(existingImageData.filePath);
  }

  const uniqueFileName = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
  const newFilePath = `${CATEGORY_IMAGES_STORAGE_PATH}/${docId}/${uniqueFileName}`;
  const storageRef = ref(storage, newFilePath);

  console.log(`Attempting to upload category image to: ${newFilePath}`);
  // Log current user UID at the point of call from client
  console.log(`Client-side auth.currentUser UID: ${auth.currentUser?.uid || 'No user authenticated on client at time of call'}`);


  try {
    const snapshot = await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const docRef = doc(db, CATEGORY_IMAGES_COLLECTION, docId);
    await setDoc(docRef, {
      imageUrl: downloadURL,
      filePath: newFilePath,
      updatedAt: serverTimestamp(),
    });
    return downloadURL;
  } catch (error) {
    console.error(`Error updating category image for ${categoryName}:`, error);
    // Attempt to clean up newly uploaded file if Firestore operation fails
    if (newFilePath) {
        await safeDeleteStorageFile(newFilePath);
    }
    if (error instanceof FirestoreError) {
      throw new Error(`Failed to update category image in Firestore: ${error.message}`);
    }
    if (error instanceof Error && (error as any).code?.startsWith('storage/')) {
        const storageErrorCode = (error as any).code;
        if (storageErrorCode === 'storage/unauthorized') {
          console.error(`Storage Unauthorized Details: Attempted path: ${newFilePath}, Authenticated User UID (from client auth object): ${auth.currentUser?.uid || 'N/A'}`);
          throw new Error("Permission denied for category image upload. Check Firebase Storage security rules.");
        }
        throw new Error(`Failed to upload category image to Storage: ${storageErrorCode}`);
    }
    throw new Error("Failed to update category image.");
  }
}

export async function deleteCategoryImage(categoryName: string): Promise<void> {
  if (!categoryName) throw new Error("Category name is required.");
  const docId = normalizeCategoryNameForId(categoryName);
  if (!docId) throw new Error("Invalid category name for ID generation.");

  const docRef = doc(db, CATEGORY_IMAGES_COLLECTION, docId);
  try {
    const imageData = await getCategoryImage(categoryName);
    if (imageData?.filePath) {
      await safeDeleteStorageFile(imageData.filePath);
    }
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting category image for ${categoryName}:`, error);
    if (error instanceof FirestoreError) {
      throw new Error(`Failed to delete category image from Firestore: ${error.message}`);
    }
    throw new Error("Failed to delete category image.");
  }
}
