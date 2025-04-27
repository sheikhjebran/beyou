
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Import useParams
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { updateProduct, getProductById, type UpdateProductData } from '@/services/productService'; // Use getProductById
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import type { Product } from '@/types/product'; // Import Product type
import Image from 'next/image'; // Import Image for current image display
import { getMainCategories, getSubCategories, type Category } from '@/lib/categories'; // Import category helpers


// Define Zod schema for validation including optional categories
const productFormSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters." }).optional(),
  type: z.enum(['Beauty', 'Clothing']).optional(), // Keep if relevant
  category: z.string().min(1, { message: "Please select a category." }).optional(), // Optional category
  subCategory: z.string().min(1, { message: "Please select a sub-category." }).optional(), // Optional sub category
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).optional(),
  price: z.coerce.number().min(0.01, { message: "Price must be a positive number." }).optional(),
  quantity: z.coerce.number().int().min(0, { message: "Quantity must be a non-negative integer." }).optional(),
  imageFile: z.instanceof(File).optional().nullable()
    .refine(file => !file || file.size <= 5 * 1024 * 1024, `Max image size is 5MB.`)
    .refine(
      file => !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only .jpg, .png, and .webp formats are supported."
    ),
})
// Add refinement to ensure subCategory is valid for the chosen category if both are provided
.refine(data => {
    if (data.category && data.subCategory) {
        const validSubCategories = getSubCategories(data.category as Category);
        return validSubCategories.includes(data.subCategory);
    }
    return true; // Pass if category or subCategory is missing (handled by individual field validation)
}, {
    message: "Sub-category is not valid for the selected category.",
    path: ["subCategory"], // Attach error to subCategory field
});


type ProductFormValues = z.infer<typeof productFormSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string; // Get productId from URL params
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productData, setProductData] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [availableSubCategories, setAvailableSubCategories] = useState<string[]>([]); // State for dynamic sub-categories


  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { // Will be populated by fetched data
      name: '',
      type: undefined,
      category: '',
      subCategory: '',
      description: '',
      price: undefined,
      quantity: undefined,
      imageFile: null,
    },
  });

  // Watch the 'category' field to update sub-categories dynamically
  const selectedCategory = form.watch('category');

  useEffect(() => {
    if (selectedCategory) {
      const subs = getSubCategories(selectedCategory as Category);
      setAvailableSubCategories(subs);
       // If the current subCategory is not valid for the new category, reset it
       const currentSubCategory = form.getValues('subCategory');
       if (currentSubCategory && !subs.includes(currentSubCategory)) {
           form.setValue('subCategory', '', { shouldValidate: true });
       }
    } else {
      setAvailableSubCategories([]);
      form.setValue('subCategory', ''); // Clear subCategory if no category selected
    }
  }, [selectedCategory, form]);


  // Fetch existing product data using getProductById
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
         const currentProduct = await getProductById(productId); // Use the efficient function

         if (currentProduct) {
           setProductData(currentProduct);
           // Populate form with fetched data
           form.reset({
             name: currentProduct.name,
             type: currentProduct.type,
             category: currentProduct.category, // Populate category
             subCategory: currentProduct.subCategory, // Populate subCategory
             description: currentProduct.description,
             price: currentProduct.price,
             quantity: currentProduct.quantity,
             imageFile: null, // Reset file input
           });
            setPreviewUrl(currentProduct.imageUrl); // Set initial preview to current image
             // Set initial sub-categories based on fetched category
             if (currentProduct.category) {
                setAvailableSubCategories(getSubCategories(currentProduct.category as Category));
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
  }, [productId, form]); // Re-run if productId changes


   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     const file = event.target.files?.[0];
     if (file) {
       form.setValue('imageFile', file, { shouldValidate: true });
       const reader = new FileReader();
       reader.onloadend = () => {
         setPreviewUrl(reader.result as string); // Update preview
       };
       reader.readAsDataURL(file);
     } else {
       form.setValue('imageFile', null);
        setPreviewUrl(productData?.imageUrl || null); // Revert preview to original if file removed
     }
   };


  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    if (!productId) {
       toast({ variant: "destructive", title: "Error", description: "Product ID is missing." });
       return;
    }

    setIsSubmitting(true);
    console.log("Form Data Submitted for Update:", data);

    // Prepare data, only including fields that have changed or the image file
     const dataToUpdate: UpdateProductData = {};
     let hasChanges = false;

     // Compare with initial productData or defaultValues if needed, but simpler to just send all optional fields
     if (data.name !== undefined && data.name !== productData?.name) { dataToUpdate.name = data.name; hasChanges = true; }
     if (data.type !== undefined && data.type !== productData?.type) { dataToUpdate.type = data.type; hasChanges = true; }
     if (data.category !== undefined && data.category !== productData?.category) { dataToUpdate.category = data.category; hasChanges = true; }
     if (data.subCategory !== undefined && data.subCategory !== productData?.subCategory) { dataToUpdate.subCategory = data.subCategory; hasChanges = true; }
     if (data.description !== undefined && data.description !== productData?.description) { dataToUpdate.description = data.description; hasChanges = true; }
     if (data.price !== undefined && data.price !== productData?.price) { dataToUpdate.price = data.price; hasChanges = true; }
     if (data.quantity !== undefined && data.quantity !== productData?.quantity) { dataToUpdate.quantity = data.quantity; hasChanges = true; }
     if (data.imageFile) { dataToUpdate.imageFile = data.imageFile; hasChanges = true; } // Always include if file selected


     if (!hasChanges) {
         toast({ title: "No Changes", description: "No modifications detected to save." });
         setIsSubmitting(false);
         return;
     }


    try {
      // Ensure subCategory is valid for the potentially updated category before sending
       if (dataToUpdate.category && !dataToUpdate.subCategory) {
          // If category changes but subCategory isn't explicitly set in the update,
          // we might need to fetch the current subCategory or enforce setting it.
          // For simplicity, the service layer now handles some validation, but UI could be stricter.
          console.warn("Category updated, but subCategory was not explicitly provided in the update data.");
          // We'll rely on the Zod refinement and the service validation for now.
       }

      await updateProduct(productId, dataToUpdate);
      toast({
        title: "Product Updated",
        description: `Product "${data.name || productData?.name}" (ID: ${productId}) has been successfully updated.`,
      });
      router.push('/admin/inventory'); // Redirect back to inventory list
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/inventory" passHref legacyBehavior>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Inventory</span>
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">Edit Product</h1>
      </div>

      {error && (
         <Alert variant="destructive">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Update the product information below.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingProduct ? (
             // Skeleton Form including category fields
             <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" /> {/* Category */}
                <Skeleton className="h-10 w-full" /> {/* Sub-Category */}
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-24" />
             </div>
          ) : productData ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Product Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Velvet Luxe Lipstick" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 {/* Product Type */}
                 <FormField
                   control={form.control}
                   name="type"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Product Type (Broad)</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}> {/* Use value prop */}
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder="Select a type" />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                           <SelectItem value="Beauty">Beauty</SelectItem>
                           <SelectItem value="Clothing">Clothing</SelectItem>
                         </SelectContent>
                       </Select>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                 {/* Main Category Dropdown */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select main category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getMainCategories().map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                 {/* Sub-Category Dropdown (Dynamic) */}
                 <FormField
                   control={form.control}
                   name="subCategory"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Sub-Category</FormLabel>
                       <Select
                         onValueChange={field.onChange}
                         value={field.value} // Ensure value is controlled
                         disabled={!selectedCategory || availableSubCategories.length === 0}
                       >
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder={selectedCategory ? "Select sub-category" : "Select category first"} />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                           {availableSubCategories.map((subCat) => (
                             <SelectItem key={subCat} value={subCat}>{subCat}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                       <FormMessage /> {/* This will show the refinement error too */}
                     </FormItem>
                   )}
                 />


                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detailed description of the product..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Price (₹)</FormLabel>
                       <FormControl>
                          <Input type="number" step="0.01" placeholder="e.g., 24.99" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                  )}
                />

                 {/* Quantity */}
                 <FormField
                   control={form.control}
                   name="quantity"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Quantity</FormLabel>
                       <FormControl>
                         <Input type="number" placeholder="e.g., 100" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                {/* Image Upload */}
                 <FormField
                   control={form.control}
                   name="imageFile"
                   render={({ field }) => ( // Destructure field correctly
                     <FormItem>
                       <FormLabel>Product Image (Upload new to replace)</FormLabel>
                        {/* Display Current Image */}
                        {productData.imageUrl && !previewUrl && (
                           <div className="mt-2 mb-4">
                             <p className="text-sm text-muted-foreground mb-1">Current Image:</p>
                             <Image src={productData.imageUrl} alt="Current product image" width={128} height={128} className="object-cover rounded-md border" />
                           </div>
                        )}
                        {/* Display Preview of New Image */}
                        {previewUrl && previewUrl !== productData.imageUrl && (
                         <div className="mt-2 mb-4">
                            <p className="text-sm text-muted-foreground mb-1">New Image Preview:</p>
                            <Image src={previewUrl} alt="New image preview" width={128} height={128} className="object-cover rounded-md border" />
                         </div>
                        )}
                       <FormControl>
                           <Input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              onChange={handleFileChange} // Use custom handler
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                           />
                       </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                <Button type="submit" disabled={isSubmitting || !form.formState.isValid} className="w-full md:w-auto">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </Form>
          ) : null /* Render nothing if loading finished but no product found (error is handled above) */ }
        </CardContent>
      </Card>
    </div>
  );
}
