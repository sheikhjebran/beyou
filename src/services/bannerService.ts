
import { db, storage } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  FirestoreError,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Banner, AddBannerData } from '@/types/banner';

const BANNERS_COLLECTION = 'banners';
const BANNERS_STORAGE_PATH = 'banners';

// Helper to serialize Firestore Timestamps
const serializeTimestamp = (timestamp: unknown): string => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  // If it's already a string (e.g., from a previous serialization or non-Timestamp field)
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return new Date().toISOString(); // Fallback, though ideally all timestamps are actual Timestamps
};


async function uploadBannerImage(file: File): Promise<{ downloadURL: string, filePath: string }> {
  const uniqueFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const filePath = `${BANNERS_STORAGE_PATH}/${uniqueFileName}`;
  const storageRef = ref(storage, filePath);
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { downloadURL, filePath };
  } catch (error) {
    console.error("Error uploading banner image: ", error);
    if (error instanceof Error && 'code' in error) {
      const storageErrorCode = (error as any).code;
      console.error(`Firebase Storage Error Code: ${storageErrorCode}`);
      if (storageErrorCode === 'storage/unauthorized' || storageErrorCode === 'storage/unauthenticated') {
        throw new Error("Permission denied for image upload. Check Firebase Storage security rules.");
      }
      throw new Error(`Image upload failed due to Storage error: ${storageErrorCode}`);
    }
    throw new Error("Banner image upload failed.");
  }
}

async function deleteBannerImageFromStorage(filePath: string | undefined): Promise<void> {
  if (!filePath) {
    console.warn("No file path provided for deletion from storage.");
    return;
  }
  try {
    const imageRef = ref(storage, filePath);
    await deleteObject(imageRef);
  } catch (error) {
    const storageErrorCode = (error as any)?.code;
    if (storageErrorCode === 'storage/object-not-found') {
      console.warn(`Image not found in storage (may have already been deleted): ${filePath}`);
    } else {
      console.warn(`Error deleting image ${filePath} from storage:`, error);
    }
  }
}

export async function addBanner(data: AddBannerData): Promise<string> {
  const { imageFile, title, subtitle } = data;

  if (!imageFile) {
    throw new Error("Banner image file is required.");
  }

  const { downloadURL, filePath } = await uploadBannerImage(imageFile);

  try {
    const bannersCollectionRef = collection(db, BANNERS_COLLECTION);
    const docRef = await addDoc(bannersCollectionRef, {
      imageUrl: downloadURL,
      filePath: filePath,
      title: title || '', // Store empty string if title is undefined/null/empty
      subtitle: subtitle || '', // Store empty string if subtitle is undefined/null/empty
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding banner to Firestore: ", error);
    // Attempt to delete uploaded image if Firestore operation fails
    await deleteBannerImageFromStorage(filePath);
    if (error instanceof FirestoreError) {
      throw new Error(`Failed to add banner to Firestore: ${error.message}`);
    }
    throw new Error("Failed to add banner.");
  }
}

export async function getBanners(): Promise<Banner[]> {
  try {
    const bannersCollectionRef = collection(db, BANNERS_COLLECTION);
    const q = query(bannersCollectionRef, orderBy('createdAt', 'desc'));
    const bannerSnapshot = await getDocs(q);

    const bannerList = bannerSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        imageUrl: data.imageUrl,
        filePath: data.filePath,
        title: data.title || '', // Ensure title is always a string, defaults to empty
        subtitle: data.subtitle || '', // Ensure subtitle is always a string, defaults to empty
        createdAt: serializeTimestamp(data.createdAt),
      } as Banner; // Casting as Banner, assuming filePath might be optional or handled
    });
    return bannerList;
  } catch (error) {
    console.warn("Warning fetching banners:", error);
    if (error instanceof FirestoreError && error.code === 'failed-precondition') {
        console.warn(`Firestore index likely required for banners query: ${error.message}. Check '${BANNERS_COLLECTION}' collection for an index on 'createdAt' (desc).`);
    }
    return [];
  }
}

export async function deleteBanner(bannerId: string, filePath: string | undefined): Promise<void> {
  const bannerDocRef = doc(db, BANNERS_COLLECTION, bannerId);
  try {
    await deleteDoc(bannerDocRef);
    // After successfully deleting from Firestore, delete from Storage
    if (filePath) {
      await deleteBannerImageFromStorage(filePath);
    }
  } catch (error) {
    console.error(`Error deleting banner ${bannerId}:`, error);
    if (error instanceof FirestoreError) {
      throw new Error(`Failed to delete banner from Firestore: ${error.message}`);
    }
    throw new Error(`Failed to delete banner ${bannerId}.`);
  }
}

