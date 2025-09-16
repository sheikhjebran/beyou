
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { addBanner, getBanners, deleteBanner, type AddBannerData } from '@/services/bannerService';
import type { Banner } from '@/types/banner';
import { Loader2, UploadCloud, Trash2, ImagePlus, AlertCircle, Palette, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMainCategories, type Category as AppCategory } from '@/lib/categories';
import { getCategoryImage, updateCategoryImage, deleteCategoryImage, type CategoryImageData } from '@/services/categoryImageService';
import { normalizeCategoryNameForId } from '@/lib/utils';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type BannerFormValues = {
  title: string;
  subtitle: string;
  imageFile: File | null;
};

const bannerFormSchema = z.object({
  title: z.string()
    .refine(val => val.length === 0 || (val.length >= 3 && val.length <= 100), {
      message: "Title must be empty or between 3 and 100 characters."
    }),
  subtitle: z.string()
    .refine(val => val.length === 0 || (val.length >= 5 && val.length <= 200), {
      message: "Subtitle must be empty or between 5 and 200 characters."
    }),
  imageFile: z.custom<File>((val) => val instanceof File)
    .refine(file => file instanceof File && file.size <= MAX_FILE_SIZE_BYTES, `Image size should be less than ${MAX_FILE_SIZE_MB}MB.`)
    .refine(file => file instanceof File && ALLOWED_IMAGE_TYPES.includes(file.type), `Only .jpg, .png, and .webp formats are supported.`)
    .nullable(),
});

const categoryImageFormSchema = z.object({
  selectedCategory: z.string().min(1, "Please select a category."),
  categoryImageFile: z.instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE_BYTES, `Image size should be less than ${MAX_FILE_SIZE_MB}MB.`)
    .refine(file => ALLOWED_IMAGE_TYPES.includes(file.type), `Only .jpg, .png, and .webp formats are supported.`)
    .optional()
    .nullable(),
});
type CategoryImageFormValues = z.infer<typeof categoryImageFormSchema>;


export default function CustomizePage() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);
  const [isSubmittingBanner, setIsSubmittingBanner] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerImagePreviewUrl, setBannerImagePreviewUrl] = useState<string | null>(null);
  const [showDeleteBannerDialog, setShowDeleteBannerDialog] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [isDeletingBanner, setIsDeletingBanner] = useState(false);

  const bannerForm = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: { title: '', subtitle: '', imageFile: null },
  });

  // States for Category Image Management
  const [mainCategories, setMainCategories] = useState<AppCategory[]>([]);
  const [currentCategoryData, setCurrentCategoryData] = useState<CategoryImageData | null>(null);
  const [categoryImagePreviewUrl, setCategoryImagePreviewUrl] = useState<string | null>(null);
  const [isLoadingCategoryImage, setIsLoadingCategoryImage] = useState(false);
  const [isUpdatingCategoryImage, setIsUpdatingCategoryImage] = useState(false);
  const [isDeletingCategoryImage, setIsDeletingCategoryImage] = useState(false);
  const [categoryImageError, setCategoryImageError] = useState<string | null>(null);
  const [showDeleteCatImgDialog, setShowDeleteCatImgDialog] = useState(false);
  const [categoryToDeleteImageFor, setCategoryToDeleteImageFor] = useState<string | null>(null);


  const categoryImageForm = useForm<CategoryImageFormValues>({
    resolver: zodResolver(categoryImageFormSchema),
    defaultValues: { selectedCategory: '', categoryImageFile: null },
  });
  const watchedCategory = categoryImageForm.watch('selectedCategory');


  useEffect(() => {
    setMainCategories(getMainCategories());
  }, []);

  useEffect(() => {
    const fetchBannerData = async () => {
      setIsLoadingBanners(true);
      setBannerError(null);
      try {
        const fetchedBanners = await getBanners();
        setBanners(fetchedBanners);
      } catch (err) {
        console.error("Error fetching banners:", err);
        setBannerError(err instanceof Error ? err.message : "Failed to load banners.");
      } finally {
        setIsLoadingBanners(false);
      }
    };
    fetchBannerData();
  }, []);
  
  useEffect(() => {
    if (watchedCategory) {
      const fetchCatImage = async () => {
        setIsLoadingCategoryImage(true);
        setCategoryImageError(null);
        categoryImageForm.resetField('categoryImageFile'); // Clear file input
        
        const defaultPlaceholder = `/coming-soon.png`;
        
        try {
          const imageData = await getCategoryImage(watchedCategory);
          setCurrentCategoryData(imageData);
          if (imageData?.imageUrl) {
            setCategoryImagePreviewUrl(imageData.imageUrl);
          } else {
            setCategoryImagePreviewUrl(defaultPlaceholder);
          }
        } catch (err) {
          setCategoryImageError(err instanceof Error ? err.message : "Failed to load category image.");
          setCategoryImagePreviewUrl(defaultPlaceholder);
        } finally {
          setIsLoadingCategoryImage(false);
        }
      };
      fetchCatImage();
    } else {
      setCurrentCategoryData(null);
      setCategoryImagePreviewUrl(null);
    }
  }, [watchedCategory, categoryImageForm]);


  const handleBannerFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      bannerForm.setValue('imageFile', file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => setBannerImagePreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      bannerForm.setValue('imageFile', null);
      setBannerImagePreviewUrl(null);
    }
  };

  const onBannerSubmit: SubmitHandler<BannerFormValues> = async (data) => {
    console.log('onBannerSubmit called with data:', {
      hasImageFile: !!data.imageFile,
      imageFileName: data.imageFile?.name,
      imageFileSize: data.imageFile?.size,
      imageFileType: data.imageFile?.type,
      title: data.title,
      subtitle: data.subtitle
    });
    
    if (!data.imageFile) {
      setBannerError("Please select an image file.");
      return;
    }
    
    if (!(data.imageFile instanceof File)) {
      setBannerError("Invalid file selected.");
      return;
    }
    
    setIsSubmittingBanner(true);
    setBannerError(null);
    try {
      // Pass title and subtitle, which might be empty strings from the form if not filled
      console.log('Calling addBanner with:', {
        imageFile: data.imageFile,
        title: data.title,
        subtitle: data.subtitle,
      });
      
      await addBanner({
        imageFile: data.imageFile,
        title: data.title,
        subtitle: data.subtitle,
      });
      toast({ title: "Banner Added", description: "New banner successfully uploaded." });
      bannerForm.reset();
      setBannerImagePreviewUrl(null);
      // Re-fetch banners to update list
      const fetchedBanners = await getBanners();
      setBanners(fetchedBanners);
    } catch (err) {
      console.error('Banner submission error:', err);
      toast({ variant: "destructive", title: "Error Adding Banner", description: err instanceof Error ? err.message : "An unexpected error occurred." });
    } finally {
      setIsSubmittingBanner(false);
    }
  };
  
  const openDeleteBannerDialog = (banner: Banner) => {
    if (banners.length <= 1) {
        toast({ variant: "destructive", title: "Cannot Delete Last Banner", description: "At least one banner image is mandatory for the homepage."});
        return;
    }
    setBannerToDelete(banner);
    setShowDeleteBannerDialog(true);
  };

  const confirmDeleteBanner = async () => {
    if (!bannerToDelete) return;
    setIsDeletingBanner(true);
    try {
      await deleteBanner(bannerToDelete.id);
      toast({ title: "Banner Deleted", description: `Banner "${bannerToDelete.title || 'Untitled'}" deleted.` });
      setBanners(prev => prev.filter(b => b.id !== bannerToDelete.id));
    } catch (err) {
      toast({ variant: "destructive", title: "Error Deleting Banner", description: err instanceof Error ? err.message : "Failed to delete banner." });
    } finally {
      setIsDeletingBanner(false);
      setShowDeleteBannerDialog(false);
      setBannerToDelete(null);
    }
  };

  // Category Image Handlers
  const handleCategoryImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      categoryImageForm.setValue('categoryImageFile', file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => setCategoryImagePreviewUrl(reader.result as string); // Show new file preview
      reader.readAsDataURL(file);
    } else {
      categoryImageForm.setValue('categoryImageFile', null, { shouldValidate: true }); 
      // Revert to current stored image or default placeholder if file is deselected
      if (currentCategoryData) {
        setCategoryImagePreviewUrl(currentCategoryData.imageUrl);
      } else if (watchedCategory) {
        setCategoryImagePreviewUrl(`https://placehold.co/400x300.png?text=${encodeURIComponent(watchedCategory)}`);
      } else {
        setCategoryImagePreviewUrl(null);
      }
    }
  };

  const onCategoryImageSubmit: SubmitHandler<CategoryImageFormValues> = async (data) => {
    if (!data.selectedCategory || !data.categoryImageFile) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please select a category and an image file." });
      return;
    }
    setIsUpdatingCategoryImage(true);
    setCategoryImageError(null);
    try {
      await updateCategoryImage(data.selectedCategory, data.categoryImageFile);
      // After update, fetch the new image data
      const imageData = await getCategoryImage(data.selectedCategory);
      setCurrentCategoryData(imageData);
      if (imageData) {
        setCategoryImagePreviewUrl(imageData.imageUrl);
      }
      toast({ title: "Category Image Updated", description: `Image for "${data.selectedCategory}" has been updated.` });
      categoryImageForm.resetField('categoryImageFile'); // Clear file input
    } catch (err) {
      setCategoryImageError(err instanceof Error ? err.message : "Failed to update category image.");
      toast({ variant: "destructive", title: "Update Failed", description: err instanceof Error ? err.message : "Could not update image." });
    } finally {
      setIsUpdatingCategoryImage(false);
    }
  };

  const openDeleteCatImgConfirmationDialog = (categoryName: string) => {
     if (!categoryName || !currentCategoryData?.imageUrl || currentCategoryData.imageUrl.includes('placehold.co')) {
      toast({ variant: "default", title: "No Custom Image", description: `There is no custom image to delete for "${categoryName}".` });
      return;
    }
    setCategoryToDeleteImageFor(categoryName);
    setShowDeleteCatImgDialog(true);
  };

  const confirmDeleteCategoryImage = async () => {
    if (!categoryToDeleteImageFor) return;
    setIsDeletingCategoryImage(true);
    setCategoryImageError(null);
    try {
      await deleteCategoryImage(categoryToDeleteImageFor);
      toast({ title: "Category Image Deleted", description: `Custom image for "${categoryToDeleteImageFor}" has been removed.` });
      setCurrentCategoryData(null); // Clear current image data
      setCategoryImagePreviewUrl(`https://placehold.co/400x300.png?text=${encodeURIComponent(categoryToDeleteImageFor)}`); // Revert to placeholder
      categoryImageForm.resetField('categoryImageFile');
    } catch (err) {
      setCategoryImageError(err instanceof Error ? err.message : "Failed to delete category image.");
      toast({ variant: "destructive", title: "Delete Failed", description: err instanceof Error ? err.message : "Could not delete image." });
    } finally {
      setIsDeletingCategoryImage(false);
      setShowDeleteCatImgDialog(false);
      setCategoryToDeleteImageFor(null);
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Palette className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Customize Store Appearance</h1>
      </div>

      {/* Banner Management Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Manage Homepage Banners</CardTitle>
          <CardDescription>Upload images with optional titles and subtitles for the homepage slideshow. Newest banners appear first.</CardDescription>
        </CardHeader>
        <CardContent>
          {bannerError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{bannerError}</AlertDescription>
            </Alert>
          )}
          <Form {...bannerForm}>
            <form onSubmit={bannerForm.handleSubmit(onBannerSubmit)} className="space-y-6">
              <FormField control={bannerForm.control} name="imageFile" render={() => (
                <FormItem>
                  <FormLabel>Banner Image (Max {MAX_FILE_SIZE_MB}MB)</FormLabel>
                  <FormControl>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="bannerImageFile-input" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70">
                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (MAX {MAX_FILE_SIZE_MB}MB)</p>
                        <Input id="bannerImageFile-input" type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} onChange={handleBannerFileChange} className="hidden" />
                      </label>
                    </div>
                  </FormControl>
                  {bannerImagePreviewUrl && (
                    <div className="mt-4 relative w-48 h-24 aspect-video mx-auto">
                      <Image src={bannerImagePreviewUrl} alt="New banner preview" fill className="object-contain rounded-md border" />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={bannerForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title (Optional)</FormLabel><FormControl><Input placeholder="e.g., Summer Collection Out Now!" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={bannerForm.control} name="subtitle" render={({ field }) => (<FormItem><FormLabel>Subtitle (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., Fresh styles to brighten your wardrobe." {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" disabled={isSubmittingBanner || !bannerForm.formState.isValid} className="w-full md:w-auto">
                {isSubmittingBanner ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />} Add Banner
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Current Banners</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingBanners ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => ( <Card key={`skeleton-banner-${i}`}><CardContent className="p-4 space-y-3"><Skeleton className="w-full h-32 rounded-md" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-8 w-20 mt-2" /></CardContent></Card> ))}
            </div>
          ) : banners.length === 0 ? (
            <Alert><AlertCircle className="h-4 w-4" /><AlertTitle>No Banners Yet</AlertTitle><AlertDescription>Upload your first banner.</AlertDescription></Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => (
                <Card key={banner.id} className="flex flex-col">
                  <div className="relative w-full h-40 aspect-video"><Image src={banner.imageUrl} alt={banner.title || 'Banner image'} fill className="object-cover rounded-t-lg" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"/></div>
                  <CardContent className="p-4 space-y-2 flex-grow">
                    {banner.title && <h3 className="font-semibold text-lg truncate" title={banner.title}>{banner.title}</h3>}
                    {banner.subtitle && <p className="text-sm text-muted-foreground line-clamp-2" title={banner.subtitle}>{banner.subtitle}</p>}
                    {!banner.title && !banner.subtitle && <p className="text-sm text-muted-foreground italic">No title or subtitle.</p>}
                    <p className="text-xs text-muted-foreground">Uploaded: {new Date(banner.createdAt).toLocaleDateString()}</p>
                  </CardContent>
                  <div className="p-4 pt-0"><Button variant="destructive" size="sm" className="w-full" onClick={() => openDeleteBannerDialog(banner)} disabled={isDeletingBanner || banners.length <= 1}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button></div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-10" />

      {/* Category Image Management Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Manage Category Images</CardTitle>
          <CardDescription>Upload or update images for your main product categories. These images appear on the homepage.</CardDescription>
        </CardHeader>
        <CardContent>
          {categoryImageError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{categoryImageError}</AlertDescription>
            </Alert>
          )}
          <Form {...categoryImageForm}>
            <form onSubmit={categoryImageForm.handleSubmit(onCategoryImageSubmit)} className="space-y-6">
              <FormField
                control={categoryImageForm.control}
                name="selectedCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mainCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedCategory && (
                <>
                  <FormItem>
                    <FormLabel>Current Image for "{watchedCategory}"</FormLabel>
                    {isLoadingCategoryImage ? (
                      <Skeleton className="w-full h-48 rounded-md" />
                    ) : categoryImagePreviewUrl ? (
                      <div className="relative w-full h-48 aspect-video border rounded-md overflow-hidden bg-muted/30">
                        <Image src={categoryImagePreviewUrl} alt={`Current image for ${watchedCategory}`} fill className="object-contain" data-ai-hint={`${watchedCategory.toLowerCase()} category display`} />
                      </div>
                    ) : (
                      <div className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 text-muted-foreground">
                        No custom image set. Default will be used.
                      </div>
                    )}
                  </FormItem>

                  <FormField
                    control={categoryImageForm.control}
                    name="categoryImageFile"
                    render={({ field: { onChange: rhfOnChange, value, ...restFieldProps } }) => ( 
                      <FormItem>
                        <FormLabel>Upload New Image (Max {MAX_FILE_SIZE_MB}MB)</FormLabel>
                        <FormControl>
                          <div className="flex items-center justify-center w-full">
                            <label htmlFor="categoryImageFile-input" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70">
                              <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                              <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (MAX {MAX_FILE_SIZE_MB}MB)</p>
                              <Input id="categoryImageFile-input" type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} 
                                onChange={(e) => {
                                    handleCategoryImageFileChange(e); 
                                    rhfOnChange(e.target.files?.[0] || null); 
                                }}
                                className="hidden"
                                {...restFieldProps} 
                               />
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit" disabled={isUpdatingCategoryImage || !categoryImageForm.getValues('categoryImageFile') || !categoryImageForm.formState.isValid || !watchedCategory} className="w-full sm:w-auto">
                      {isUpdatingCategoryImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                      Update Image for "{watchedCategory}"
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => openDeleteCatImgConfirmationDialog(watchedCategory)}
                      disabled={
                        isDeletingCategoryImage || 
                        !watchedCategory || 
                        !currentCategoryData?.imageUrl || 
                        currentCategoryData.imageUrl === '/coming-soon.png'
                      }
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Custom Image
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>


      {/* Delete Banner Confirmation Dialog */}
      {bannerToDelete && (
        <AlertDialog open={showDeleteBannerDialog} onOpenChange={setShowDeleteBannerDialog}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the banner titled "{bannerToDelete.title || 'Untitled Banner'}". This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {setShowDeleteBannerDialog(false); setBannerToDelete(null);}}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteBanner} disabled={isDeletingBanner} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isDeletingBanner && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete Banner
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

       {/* Delete Category Image Confirmation Dialog */}
      {categoryToDeleteImageFor && (
        <AlertDialog open={showDeleteCatImgDialog} onOpenChange={setShowDeleteCatImgDialog}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Confirm Deletion</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete the custom image for category "{categoryToDeleteImageFor}"? The category will revert to a default placeholder image.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {setShowDeleteCatImgDialog(false); setCategoryToDeleteImageFor(null);}}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteCategoryImage} disabled={isDeletingCategoryImage} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isDeletingCategoryImage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete Image
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

    
