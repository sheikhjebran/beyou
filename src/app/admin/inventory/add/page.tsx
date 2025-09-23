
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { addProduct } from '@/services/productService';
import type { AddProductData } from '@/types/productForm';
import { Loader2, ArrowLeft, AlertCircle, UploadCloud, XCircle } from 'lucide-react';
import Link from 'next/link';
import { getMainCategories, getSubCategories, type Category } from '@/lib/categories';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const productFormSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  subCategory: z.string().optional(),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  price: z.coerce.number().min(0.01, { message: "Price must be a positive number." }),
  stock_quantity: z.coerce.number().int().min(0, { message: "Stock quantity must be a non-negative integer." }),
  imageFiles: z.array(z.instanceof(File))
    .min(1, "Please upload at least one image.") // Ensure at least one image
    .max(MAX_FILES, `You can upload a maximum of ${MAX_FILES} images.`)
    .refine(files => files.every(file => file.size <= MAX_FILE_SIZE_BYTES),
      `Each image size should be less than ${MAX_FILE_SIZE_MB}MB.`)
    .refine(files => files.every(file => ALLOWED_IMAGE_TYPES.includes(file.type)),
      `Only .jpg, .png, and .webp formats are supported.`)
}).refine(data => {
  if (data.category !== 'Custom Prints') {
    return data.subCategory && data.subCategory.length > 0;
  }
  return true;
}, {
  message: "Please select a sub-category.",
  path: ["subCategory"],
}).refine(data => {
  if (data.category !== 'Custom Prints' && data.subCategory) {
    const validSubCategories = getSubCategories(data.category as Category);
    return validSubCategories.includes(data.subCategory);
  }
  return true;
}, {
  message: "Selected sub-category is not valid for the chosen category.",
  path: ["subCategory"],
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [availableSubCategories, setAvailableSubCategories] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      category: '',
      subCategory: '',
      description: '',
      price: 0,
      stock_quantity: 0,
      imageFiles: [], // Initialize as empty array
    },
  });

  const selectedCategory = form.watch('category');

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
        } else if (!currentSubCategory) {
             form.setValue('subCategory', '', { shouldValidate: true });
        }
      }
    } else {
      setAvailableSubCategories([]);
      form.setValue('subCategory', '', { shouldValidate: true });
    }
  }, [selectedCategory, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const filesArray = Array.from(files).slice(0, MAX_FILES);
      form.setValue('imageFiles', filesArray, { shouldValidate: true });
      setPrimaryImageIndex(0); // Reset primary to first image

      const newPreviewUrls: string[] = [];
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviewUrls.push(reader.result as string);
          if (newPreviewUrls.length === filesArray.length) {
            setPreviewUrls([...newPreviewUrls]);
          }
        };
        reader.readAsDataURL(file);
      });
      if (filesArray.length === 0) {
        setPreviewUrls([]);
      }
    } else {
      form.setValue('imageFiles', []);
      setPreviewUrls([]);
      setPrimaryImageIndex(0);
    }
  };

  const removePreviewImage = (index: number) => {
    const currentFiles = form.getValues('imageFiles') || [];
    const updatedFiles = currentFiles.filter((_, i) => i !== index);
    form.setValue('imageFiles', updatedFiles.length > 0 ? updatedFiles : [], { shouldValidate: true });

    const updatedPreviewUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(updatedPreviewUrls);

    if (updatedFiles.length === 0) {
        setPrimaryImageIndex(0);
    } else if (index === primaryImageIndex) {
      setPrimaryImageIndex(0); 
    } else if (index < primaryImageIndex) {
      setPrimaryImageIndex(prev => prev - 1);
    }
  };

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setIsSubmitting(true);
    const productData: AddProductData = {
        name: data.name,
        category: data.category,
        subCategory: data.category === 'Custom Prints' ? '' : data.subCategory || '',
        description: data.description,
        price: data.price,
        stock_quantity: data.stock_quantity,
        imageFiles: data.imageFiles || [],
        primaryImageIndex: primaryImageIndex,
    };

    try {
      const newProductId = await addProduct(productData);
      toast({
        title: "Product Added",
        description: `Product "${data.name}" (ID: ${newProductId}) has been successfully added.`,
      });
      form.reset();
      setPreviewUrls([]);
      setAvailableSubCategories([]);
      setPrimaryImageIndex(0);
      router.push('/admin/inventory');
    } catch (error) {
       console.error("Error adding product:", error);
       toast({
         variant: "destructive",
         title: "Error Adding Product",
         description: error instanceof Error ? error.message : "An unexpected error occurred.",
       });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/inventory" className="inline-block">
           <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Inventory</span>
           </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">Add New Product</h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Fill in the information for the new product. Upload at least 1 and up to {MAX_FILES} images. Click an image to mark it as primary.</CardDescription>
        </CardHeader>
        <CardContent>
           <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., Velvet Luxe Lipstick" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select main category" /></SelectTrigger></FormControl><SelectContent>{getMainCategories().map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="subCategory" render={({ field }) => (<FormItem><FormLabel>Sub-Category</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedCategory || selectedCategory === 'Custom Prints' || availableSubCategories.length === 0}><FormControl><SelectTrigger><SelectValue placeholder={selectedCategory === 'Custom Prints' ? "N/A (Custom Prints)" : (selectedCategory ? "Select sub-category" : "Select category first")} /></SelectTrigger></FormControl><SelectContent>{availableSubCategories.map((subCat) => (<SelectItem key={subCat} value={subCat}>{subCat}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Detailed description of the product..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 24.99" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="stock_quantity" render={({ field }) => (<FormItem><FormLabel>Stock Quantity</FormLabel><FormControl><Input type="number" placeholder="e.g., 100" {...field} /></FormControl><FormMessage /></FormItem>)} />
                
                <FormField
                  control={form.control}
                  name="imageFiles"
                  render={() => (
                    <FormItem>
                      <FormLabel>Product Images (Max {MAX_FILES}, up to {MAX_FILE_SIZE_MB}MB each)</FormLabel>
                      <FormControl>
                        <div className="flex items-center justify-center w-full">
                          <label htmlFor="imageFiles-input" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70">
                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (MAX {MAX_FILE_SIZE_MB}MB each, up to {MAX_FILES} images)</p>
                            <Input id="imageFiles-input" type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} multiple onChange={handleFileChange} className="hidden" />
                          </label>
                        </div>
                      </FormControl>
                      {previewUrls.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative aspect-square group cursor-pointer" onClick={() => setPrimaryImageIndex(index)}>
                              <Image src={url} alt={`Preview ${index + 1}`} fill className={`object-cover rounded-md border-2 ${index === primaryImageIndex ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`} />
                              {index === primaryImageIndex && (
                                <Badge variant="default" className="absolute top-1 left-1 text-xs z-10">Primary</Badge>
                              )}
                              <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-20" onClick={(e) => { e.stopPropagation(); removePreviewImage(index); }}>
                                <XCircle className="h-4 w-4" />
                                <span className="sr-only">Remove image {index + 1}</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {(!form.formState.isValid && !isSubmitting && (form.formState.isDirty || form.formState.isSubmitted)) && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Button Disabled</AlertTitle>
                        <AlertDescription>
                            The 'Add Product' button is currently disabled. Please ensure all required fields are filled correctly, including uploading at least one image.
                        </AlertDescription>
                    </Alert>
                )}
                 <Button type="submit" disabled={isSubmitting || !form.formState.isValid} className="w-full md:w-auto">
                   {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Product...</>) : ('Add Product')}
                 </Button>
              </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
