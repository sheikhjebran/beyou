
// Firebase auth operations are typically client-side.
// 'use server' was removed as onAuthUserChanged is not async and not a server action.

import { auth, storage } from '@/lib/firebase'; // Added storage
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile, // Added updateProfile
  updatePassword as firebaseUpdatePassword, // Added firebaseUpdatePassword
  type User,
  type AuthError
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Added for image upload

// Sign Up with Email and Password
export async function signUpWithEmailPassword(email: string, password: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    const authError = error as AuthError;
    console.error("Error signing up:", authError.message, `(Code: ${authError.code})`);
    throw new Error(authError.message || "Failed to sign up.");
  }
}

// Sign In with Email and Password
export async function signInWithEmailPassword(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    const authError = error as AuthError;
    // Changed console.error to console.warn for handled invalid credential errors
    console.warn("Sign-in attempt failed:", authError.message, `(Code: ${authError.code})`);
    // Provide more user-friendly error messages
    if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
      throw new Error("Invalid email or password.");
    }
    throw new Error(authError.message || "Failed to sign in.");
  }
}

// Sign Out
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    const authError = error as AuthError;
    console.error("Error signing out:", authError.message);
    throw new Error(authError.message || "Failed to sign out.");
  }
}

// Observe Auth State Changes
// This function returns an unsubscribe function
export function onAuthUserChanged(callback: (user: User | null) => void): () => void {
  return firebaseOnAuthStateChanged(auth, callback);
}


// Update User Display Name
export async function updateUserDisplayName(displayName: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("No user is currently signed in.");
  }
  try {
    await updateProfile(auth.currentUser, { displayName });
  } catch (error) {
    const authError = error as AuthError;
    console.error("Error updating display name:", authError.message);
    throw new Error(authError.message || "Failed to update display name.");
  }
}

// Update User Password
export async function updateUserPassword(newPassword: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("No user is currently signed in.");
  }
  try {
    await firebaseUpdatePassword(auth.currentUser, newPassword);
  } catch (error) {
    const authError = error as AuthError;
    console.error("Error updating password:", authError.message);
    // Firebase often requires recent login for password updates.
    if (authError.code === 'auth/requires-recent-login') {
      throw new Error("This operation is sensitive and requires recent authentication. Please log out and log back in before updating your password.");
    }
    throw new Error(authError.message || "Failed to update password.");
  }
}

// Upload Profile Image and Update User Profile
export async function updateUserProfilePicture(imageFile: File): Promise<string> {
  if (!auth.currentUser) {
    throw new Error("No user is currently signed in.");
  }
  const userId = auth.currentUser.uid;
  const filePath = `profile-images/${userId}/${imageFile.name}`;
  const imageRef = ref(storage, filePath);

  try {
    const snapshot = await uploadBytes(imageRef, imageFile);
    const photoURL = await getDownloadURL(snapshot.ref);
    await updateProfile(auth.currentUser, { photoURL });
    return photoURL;
  } catch (error) {
    const authError = error as AuthError; // It might be a Storage error, but AuthError is a common shape
    console.error("Error uploading profile picture or updating profile:", authError.message);
    throw new Error(authError.message || "Failed to update profile picture.");
  }
}

