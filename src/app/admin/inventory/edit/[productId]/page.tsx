'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { updateProduct, getProductById } from '@/services/productService';
// import type { UpdateProductData } from '@/services/productService';
// If you need the type, define it locally or use the correct exported type from productService.
type UpdateProductData = {
  name: string;
  category: string;
  subCategory?: string;
  description: string;
  price: number;
  stockQuantity: number;
  isBestSeller?: boolean;
  imageFiles?: File[] | null;
  newPrimaryImageIndexForUpload?: number;
  makeExistingImagePrimary?: string;
};
import { Loader2, ArrowLeft, AlertCircle, UploadCloud, XCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types/product';
import { LoadingImage } from '@/components/loading-image';
import { getMainCategories, getSubCategories, type Category } from '@/lib/categories';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Local interface that matches what the server expects
interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  stock_quantity?: number; // Server expects this field name
  category?: string;
  subcategory?: string; // Server expects this field name (not sub_category)
  is_best_seller?: boolean; // Server expects this field name
  imageFiles?: File[] | null;
  newPrimaryImageIndexForUpload?: number;
  makeExistingImagePrimary?: string;
}

const productFormSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  subCategory: z.string().optional(),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  price: z.coerce.number().min(0.01, { message: "Price must be a positive number." }),
  stockQuantity: z.coerce.number().int().min(0, { message: "Quantity must be a non-negative integer." }),
  isBestSeller: z.boolean().default(false),
  imageFiles: z.array(z.instanceof(File))
    .max(MAX_FILES, `You can upload a maximum of ${MAX_FILES} images.`)
    .optional()
    .nullable()
     .refine(files => !files || files.every(file => file.size <= MAX_FILE_SIZE_BYTES),
      `Each image size should be less than ${MAX_FILE_SIZE_MB}MB.`)
    .refine(files => !files || files.every(file => ALLOWED_IMAGE_TYPES.includes(file.type)),
      `Only .jpg, .png, and .webp formats are supported.`),
})
.refine(data => {
  if (data.category && data.category !== 'Custom Prints') {
    return data.subCategory && data.subCategory.length > 0;
  }
  return true;
}, {
  message: "Please select a sub-category.",
  path: ["subCategory"],
})
.refine(data => {
  if (data.category && data.category !== 'Custom Prints' && data.subCategory) {
    const validSubCategories = getSubCategories(data.category as Category);
    return validSubCategories.includes(data.subCategory);
  }
  return true;
}, {
  message: "Selected sub-category is not valid for the chosen category.",
  path: ["subCategory"],
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productData, setProductData] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [currentImagePreviews, setCurrentImagePreviews] = useState<string[]>([]); // Stores URLs of existing images
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]); // Stores data URLs of newly selected files for preview
  const [primaryImageMarker, setPrimaryImageMarker] = useState<string | number | null>(null); // URL for existing, index for new

  const [availableSubCategories, setAvailableSubCategories] = useState<string[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      category: '',
      subCategory: '',
      description: '',
      price: undefined,
      stockQuantity: undefined,
      isBestSeller: false,
      imageFiles: null,
    },
  });

  const selectedCategory = form.watch('category');
  const watchedIsBestSeller = form.watch('isBestSeller');

  useEffect(() => {
    if (selectedCategory) {
      if (selectedCategory === 'Custom Prints') {
        setAvailableSubCategories([]);
        form.setValue('subCategory', '', { shouldValidate: true });
      } else {
        const subs = getSubCategories(selectedCategory as Category);
        setAvailableSubCategories(subs);
        const currentSubCategory = form.getValues('subCategory');
        if (currentSubCategory && !subs.includes(currentSubCategory)) {
           form.setValue('subCategory', '', { shouldValidate: true });
        } else if (!currentSubCategory && productData?.category !== selectedCategory) {
            form.setValue('subCategory', '', { shouldValidate: true });
        }
      }
    } else {
      setAvailableSubCategories([]);
      form.setValue('subCategory', '');
    }
  }, [selectedCategory, form, productData]);


  useEffect(() => {
     if (!productId) {
         setError("Product ID not found in URL.");
         setIsLoadingProduct(false);
         return;
     }
    async function fetchProduct() {
      setIsLoadingProduct(true);
      setError(null);
      try {
         const currentProduct = await getProductById(productId);
         if (currentProduct) {
           setProductData(currentProduct);
           form.reset({
             name: currentProduct.name,
             category: currentProduct.category,
             subCategory: currentProduct.subcategory ?? '',
             description: currentProduct.description ?? '',
             price: currentProduct.price,
             stockQuantity: currentProduct.stock_quantity,
             isBestSeller: currentProduct.is_best_seller,
             imageFiles: null, // Reset file input
           });
            // Process image URLs to ensure they're absolute
            const processImageUrl = (url: string) => {
                if (!url) return null;
                if (url.startsWith('http://') || url.startsWith('https://')) {
                    return url;
                }
                // Ensure the URL starts with a forward slash
                return url.startsWith('/') ? url : `/${url}`;
            };

            // Order existing images: primary first, then others
            const orderedExistingImages = [
                ...(currentProduct.primary_image_path ? [processImageUrl(currentProduct.primary_image_path)] : []), 
                ...(currentProduct.image_paths || [])
                    .filter(url => url !== currentProduct.primary_image_path)
                    .map(processImageUrl)
            ].filter(Boolean) as string[]; // Filter out null/undefined

            console.log('Ordered images:', orderedExistingImages);
            setCurrentImagePreviews(orderedExistingImages);
            const primaryUrl = currentProduct.primary_image_path ? processImageUrl(currentProduct.primary_image_path) : null;
            setPrimaryImageMarker(primaryUrl || (orderedExistingImages.length > 0 ? orderedExistingImages[0] : null));
            setNewImagePreviews([]); // Clear any new previews from previous states

             if (currentProduct.category) {
                if (currentProduct.category === 'Custom Prints') {
                    setAvailableSubCategories([]);
                } else {
                    setAvailableSubCategories(getSubCategories(currentProduct.category as Category));
                }
             }
         } else {
           setError(`Product with ID ${productId} not found.`);
         }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err instanceof Error ? err.message : "Failed to load product data.");
      } finally {
        setIsLoadingProduct(false);
      }
    }
    fetchProduct();
  }, [productId, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files).slice(0, MAX_FILES);
      form.setValue('imageFiles', filesArray, { shouldValidate: true });

      const newPreviews: string[] = [];
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === filesArray.length) {
            setNewImagePreviews([...newPreviews]);
            setPrimaryImageMarker(0); // New files uploaded, primary is the first of these by index
            setCurrentImagePreviews([]); // Hide current images as new ones are being staged
            form.setValue('imageFiles', form.getValues('imageFiles'), { shouldDirty: true });
          }
        };
        reader.readAsDataURL(file);
      });
    } else { // Files cleared from input
      form.setValue('imageFiles', null, {shouldValidate: true});
      setNewImagePreviews([]);
      // Restore current images and primary marker
      if (productData) {
        const orderedInitialImages = [productData.primary_image_path, ...(productData.image_paths || []).filter((url: string) => url !== productData.primary_image_path)].filter(Boolean) as string[];
        setCurrentImagePreviews(orderedInitialImages);
        setPrimaryImageMarker(productData.primary_image_path);
      }
      form.setValue('imageFiles', [], { shouldDirty: true }); // Mark as dirty to allow saving "no images"
    }
  };

  const removeNewPreviewImage = (index: number) => {
    const currentFiles = form.getValues('imageFiles') || [];
    const updatedFiles = currentFiles.filter((_, i) => i !== index);
    form.setValue('imageFiles', updatedFiles.length > 0 ? updatedFiles : null, { shouldValidate: true });

    const updatedPreviewUrls = newImagePreviews.filter((_, i) => i !== index);
    setNewImagePreviews(updatedPreviewUrls);

    if (updatedFiles.length === 0) { // All new previews removed, revert to current images
        if (productData) {
            const orderedInitialImages = [productData.primary_image_path, ...(productData.image_paths || []).filter((url: string) => url !== productData.primary_image_path)].filter(Boolean) as string[];
            setCurrentImagePreviews(orderedInitialImages);
            setPrimaryImageMarker(productData.primary_image_path);
        }
    } else {
        // Adjust primaryImageMarker if it was an index for new files
        if (typeof primaryImageMarker === 'number') {
            if (index === primaryImageMarker) {
                setPrimaryImageMarker(0); 
            } else if (index < primaryImageMarker) {
                setPrimaryImageMarker(prev => (typeof prev === 'number' ? prev -1 : 0));
            }
        }
    }
    form.setValue('imageFiles', updatedFiles.length > 0 ? updatedFiles : null, { shouldDirty: true });
  };
  
  const handleSetPrimary = async (imagePath: string) => {
    if (!productId || imagePath === primaryImageMarker) return;

    try {
        const response = await fetch(`/api/products/images?productId=${productId}&imagePath=${encodeURIComponent(imagePath)}`, {
            method: 'PUT'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to set primary image');
        }

        setPrimaryImageMarker(imagePath);
        toast({
            title: "Success",
            description: "Primary image updated successfully"
        });
    } catch (error) {
        console.error('Error setting primary image:', error);
        toast({
            variant: "destructive",
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to set primary image"
        });
    }
  };

  const handleDeleteImage = async (imagePath: string) => {
    if (!productId || imagePath === primaryImageMarker) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Cannot delete the primary image. Please set another image as primary first."
        });
        return;
    }

    if (!confirm('Are you sure you want to delete this image?')) {
        return;
    }

    try {
        const response = await fetch(`/api/products/images?productId=${productId}&imagePath=${encodeURIComponent(imagePath)}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete image');
        }

        // Remove the image from currentImagePreviews
        setCurrentImagePreviews(prev => prev.filter(url => url !== imagePath));
        toast({
            title: "Success",
            description: "Image deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        toast({
            variant: "destructive",
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to delete image"
        });
    }
  };

  const handleNewPreviewClick = (index: number) => {
      setPrimaryImageMarker(index);
      form.setValue('name', form.getValues('name'), { shouldDirty: true }); 
  }


  const onSubmit: SubmitHandler<ProductFormValues> = async (values) => {
    if (!productId || !productData) {
       toast({ variant: "destructive", title: "Error", description: "Product data is missing." });
       return;
    }
    setIsSubmitting(true);

    const dataToUpdate: Partial<UpdateProductData> = {};
    let hasChanges = false;

    // Check for changes in standard fields
    (Object.keys(values) as Array<keyof ProductFormValues>).forEach(key => {
        if (key !== 'imageFiles' && values[key] !== undefined) {
             const formValue = values[key];
             const productValue = (productData as any)[key];
             // Explicitly check boolean `isBestSeller`
             if (key === 'isBestSeller' && formValue !== (productValue || false)) {
                  (dataToUpdate as any)[key] = formValue;
                  hasChanges = true;
             } else if (key !== 'isBestSeller' && formValue !== productValue) {
                  (dataToUpdate as any)[key] = formValue;
                  hasChanges = true;
             }
        }
    });

     if (values.category && values.category === 'Custom Prints' && (productData.subcategory || values.subCategory)) {
        dataToUpdate.subCategory = ''; // Ensure subCategory is cleared for Custom Prints
        if (productData.subcategory) hasChanges = true; // Only mark as change if it was previously set
    }


    const newFiles = form.getValues('imageFiles');

    if (newFiles && newFiles.length > 0) {
        dataToUpdate.imageFiles = newFiles;
        if (typeof primaryImageMarker === 'number') {
            dataToUpdate.newPrimaryImageIndexForUpload = primaryImageMarker;
        } else {
            dataToUpdate.newPrimaryImageIndexForUpload = 0; // Default to first if marker is somehow invalid
        }
        hasChanges = true;
    } else if (form.formState.dirtyFields.imageFiles && (!newFiles || newFiles.length === 0) && newImagePreviews.length === 0 && currentImagePreviews.length > 0) {
        dataToUpdate.imageFiles = null; // Signal to delete all images
        hasChanges = true;
    } else if (typeof primaryImageMarker === 'string' && primaryImageMarker !== productData.primary_image_path && currentImagePreviews.includes(primaryImageMarker)) {
        // No new files uploaded, but an existing image was chosen as primary
        dataToUpdate.makeExistingImagePrimary = primaryImageMarker;
        hasChanges = true;
    }


    if (!hasChanges) {
        toast({ title: "No Changes", description: "No modifications detected to save." });
        setIsSubmitting(false);
        return;
    }

     // Final check for subCategory validity
    const finalCategory = dataToUpdate.category || productData.category;
    if (finalCategory && finalCategory !== 'Custom Prints') {
        const finalSubCategory = dataToUpdate.subCategory === undefined ? productData.subcategory : dataToUpdate.subCategory;
        if (!finalSubCategory || finalSubCategory.length === 0) {
             form.setError("subCategory", {type: "manual", message: "Sub-category is required for this category."});
             setIsSubmitting(false);
             return;
        }
        const validSubCategories = getSubCategories(finalCategory as Category);
        if (!validSubCategories.includes(finalSubCategory as any)) {
            form.setError("subCategory", {type: "manual", message: "Selected sub-category is not valid for the chosen category."});
            setIsSubmitting(false);
            return;
        }
    }


    try {
      // Ensure all required fields are present for UpdateProductPayload
      const updatePayload: UpdateProductPayload = {
        name: dataToUpdate.name ?? productData.name,
        category: dataToUpdate.category ?? productData.category,
        description: dataToUpdate.description ?? productData.description ?? '',
        price: dataToUpdate.price ?? productData.price,
        stock_quantity: dataToUpdate.stockQuantity ?? productData.stock_quantity,
        subcategory: (dataToUpdate.subCategory ?? productData.subcategory) !== undefined
          ? String(dataToUpdate.subCategory ?? productData.subcategory)
          : '', // Always a string, never undefined
        is_best_seller: Boolean(dataToUpdate.isBestSeller ?? productData.is_best_seller ?? false),
        imageFiles: dataToUpdate.imageFiles ?? null,
        newPrimaryImageIndexForUpload: dataToUpdate.newPrimaryImageIndexForUpload,
        makeExistingImagePrimary: dataToUpdate.makeExistingImagePrimary,
      };

      await updateProduct(productId, updatePayload as any);
      toast({
        title: "Product Updated",
        description: `Product "${values.name || productData.name}" has been successfully updated.`,
      });
      router.push('/admin/inventory');
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        variant: "destructive",
        title: "Error Updating Product",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isSaveDisabled = isSubmitting || !form.formState.isDirty || !form.formState.isValid;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/inventory" className="inline-block">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Inventory</span>
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">Edit Product</h1>
      </div>

      {error && (<Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>)}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Update information. Uploading new images replaces all current ones. Click an image to mark as primary.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingProduct ? (
             <div className="space-y-6"> <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" /> <Skeleton className="h-20 w-full" /> <Skeleton className="h-10 w-1/2" /> <Skeleton className="h-10 w-1/2" /> <Skeleton className="h-32 w-full" /> <Skeleton className="h-10 w-24" /> </div>
          ) : productData ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., Velvet Luxe Lipstick" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select main category" /></SelectTrigger></FormControl><SelectContent>{getMainCategories().map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="subCategory" render={({ field }) => (<FormItem><FormLabel>Sub-Category</FormLabel><Select onValueChange={field.onChange} value={field.value || ''} disabled={!selectedCategory || selectedCategory === 'Custom Prints' || availableSubCategories.length === 0}><FormControl><SelectTrigger><SelectValue placeholder={selectedCategory === 'Custom Prints' ? "N/A (Custom Prints)" : (selectedCategory ? "Select sub-category" : "Select category first")} /></SelectTrigger></FormControl><SelectContent>{availableSubCategories.map((subCat) => (<SelectItem key={subCat} value={subCat}>{subCat}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Detailed description of the product..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 24.99" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="stockQuantity" render={({ field }) => (<FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" placeholder="e.g., 100" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                
                <FormField control={form.control} name="isBestSeller" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2"><Star className="text-amber-500"/> Best Seller</FormLabel>
                        <FormDescription>Feature this product on the homepage.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                )} />


                <FormField
                  control={form.control}
                  name="imageFiles"
                  render={() => (
                    <FormItem>
                      <FormLabel>Product Images (Upload new to replace all. Max {MAX_FILES}, up to {MAX_FILE_SIZE_MB}MB each)</FormLabel>
                        {(currentImagePreviews.length > 0 && newImagePreviews.length === 0) && (
                            <div className="mt-2 mb-4">
                                <p className="text-sm text-muted-foreground mb-1">Current Images (Click to make primary):</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {currentImagePreviews.map((url, index) => (
                                        <div key={`current-${index}`} className="relative aspect-square group">
                                            <div className="relative w-full h-full">
                                                <LoadingImage 
                                                    src={url} 
                                                    alt={`Current image ${index + 1}`} 
                                                    fill 
                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                                    className={`object-cover rounded-md border-2 ${url === primaryImageMarker ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`}
                                                />
                                            </div>
                                            {url === primaryImageMarker ? (
                                                <Badge variant="secondary" className="absolute top-1 left-1 text-xs z-10">Primary</Badge>
                                            ) : (
                                                <div className="absolute top-1 right-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="icon"
                                                        className="h-6 w-6 bg-white hover:bg-white/90"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSetPrimary(url);
                                                        }}
                                                    >
                                                        <Star className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteImage(url);
                                                        }}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {newImagePreviews.length > 0 && (
                            <div className="mt-2 mb-4">
                                <p className="text-sm text-muted-foreground mb-1">New Images Preview (Click to make primary):</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {newImagePreviews.map((url, index) => (
                                        <div key={`new-${index}`} className="relative aspect-square group cursor-pointer" onClick={() => handleNewPreviewClick(index)}>
                                            <LoadingImage src={url} alt={`New preview ${index + 1}`} fill className={`object-cover rounded-md border-2 ${index === primaryImageMarker ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`} />
                                            {index === primaryImageMarker && <Badge variant="default" className="absolute top-1 left-1 text-xs z-10">Primary</Badge>}
                                            <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-20" onClick={(e) => {e.stopPropagation(); removeNewPreviewImage(index)}}>
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                       <FormControl>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="imageFiles-input-edit" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70">
                                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload new images</span></p>
                                <p className="text-xs text-muted-foreground">(Replaces all current images)</p>
                                <Input id="imageFiles-input-edit" type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} multiple onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                       </FormControl>
                      <FormMessage />
                       {form.formState.errors.imageFiles && !newImagePreviews.length && !currentImagePreviews.length && (
                           <p className="text-sm font-medium text-destructive">At least one image is required if no current images exist or if replacing.</p>
                       )}
                    </FormItem>
                  )}
                />
                {(!form.formState.isValid && !isSubmitting && (form.formState.isDirty || form.formState.isSubmitted)) && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" /><AlertTitle>Button Disabled</AlertTitle>
                        <AlertDescription>The 'Save Changes' button is disabled. Ensure all modified fields are valid. If replacing images, at least one new image must be uploaded.</AlertDescription>
                    </Alert>
                )}
                <Button type="submit" disabled={isSaveDisabled} className="w-full md:w-auto">
                  {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving Changes...</>) : ('Save Changes')}
                </Button>
              </form>
            </Form>
          ) : null }
        </CardContent>
      </Card>
    </div>
  );
}
