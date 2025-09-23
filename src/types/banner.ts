
export type Banner = {
  id: string;
  imageUrl: string;
  title?: string; // Now optional
  subtitle?: string; // Now optional
  createdAt: string; // ISO string representation of creation date
  filePath?: string; // Store the storage path for deletion
};

export type AddBannerData = {
  imageFile: File;
  title?: string; // Now optional
  subtitle?: string; // Now optional
};

