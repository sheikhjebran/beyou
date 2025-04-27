
'use client';

import React, { useState, useEffect } from 'react'; // Added useEffect
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
import { addProduct, type AddProductData } from '@/services/productService'; // Import service
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getMainCategories, getSubCategories, type Category } from '@/lib/categories'; // Import category helpers


// Define Zod schema for validation including categories
const productFormSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters." }),
  type: z.enum(['Beauty', 'Clothing'], { required_error: "Please select a product type." }), // Keep if still relevant for broad filtering
  category: z.string().min(1, { message: "Please select a category." }), // Main category
  subCategory: z.string().min(1, { message: "Please select a sub-category." }), // Sub category
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  price: z.coerce.number().min(0.01, { message: "Price must be a positive number." }),
  quantity: z.coerce.number().int().min(0, { message: "Quantity must be a non-negative integer." }),
  imageFile: z.instanceof(File).optional().nullable()
     .refine(file => !file || file.size <= 5 * 1024 * 1024, `Max image size is 5MB.`)
     .refine(
       file => !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type),
       "Only .jpg, .png, and .webp formats are supported."
     ),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [availableSubCategories, setAvailableSubCategories] = useState<string[]>([]); // State for dynamic sub-categories

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      type: undefined,
      category: '', // Initialize category
      subCategory: '', // Initialize subCategory
      description: '',
      price: 0,
      quantity: 0,
      imageFile: null,
    },
  });

  // Watch the 'category' field to update sub-categories
  const selectedCategory = form.watch('category');

  useEffect(() => {
    if (selectedCategory) {
      const subs = getSubCategories(selectedCategory as Category); // Fetch sub-categories
      setAvailableSubCategories(subs);
      form.setValue('subCategory', ''); // Reset subCategory when category changes
    } else {
      setAvailableSubCategories([]);
      form.setValue('subCategory', ''); // Clear subCategory if no category selected
    }
  }, [selectedCategory, form]);


   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     const file = event.target.files?.[0];
     if (file) {
       form.setValue('imageFile', file, { shouldValidate: true });
       const reader = new FileReader();
       reader.onloadend = () => {
         setPreviewUrl(reader.result as string);
       };
       reader.readAsDataURL(file);
     } else {
       form.setValue('imageFile', null);
       setPreviewUrl(null);
     }
   };


  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setIsSubmitting(true);
    console.log("Form Data Submitted:", data);

    // Prepare data for the service function
    const productData: AddProductData = {
        name: data.name,
        type: data.type,
        category: data.category, // Include category
        subCategory: data.subCategory, // Include subCategory
        description: data.description,
        price: data.price,
        quantity: data.quantity,
        imageFile: data.imageFile, // Pass the File object
    };

    try {
      const newProductId = await addProduct(productData);
      toast({
        title: "Product Added",
        description: `Product "${data.name}" (ID: ${newProductId}) has been successfully added.`,
      });
      form.reset(); // Reset form after successful submission
      setPreviewUrl(null); // Clear image preview
      setAvailableSubCategories([]); // Clear sub-categories
      router.push('/admin/inventory'); // Redirect back to inventory list
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
        <Link href="/admin/inventory" passHref legacyBehavior>
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
          <CardDescription>Fill in the information for the new product.</CardDescription>
        </CardHeader>
        <CardContent>
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

                 {/* Product Type (keep if used for filtering/display, otherwise optional) */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Type (Broad)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a type (e.g., Beauty, Clothing)" />
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
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // No need to manually call getSubCategories here, useEffect handles it
                          }}
                          defaultValue={field.value}
                        >
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
                         value={field.value} // Controlled component
                         disabled={!selectedCategory || availableSubCategories.length === 0} // Disable if no category or sub-categories
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
                       <FormMessage />
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
                          {/* Ensure input type is number and step allows decimals */}
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
                   render={({ field }) => ( // No need to manage file state separately, RHF handles it
                     <FormItem>
                       <FormLabel>Product Image (Optional)</FormLabel>
                       <FormControl>
                           <Input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              onChange={handleFileChange} // Use custom handler to update RHF and preview
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                           />
                       </FormControl>
                        {previewUrl && (
                         <div className="mt-4">
                            <p className="text-sm text-muted-foreground">Image Preview:</p>
                            <img src={previewUrl} alt="Image preview" className="mt-2 h-32 w-32 object-cover rounded-md border" />
                         </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                 <Button type="submit" disabled={isSubmitting || !form.formState.isValid} className="w-full md:w-auto">
                   {isSubmitting ? (
                      <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Product...
                     </>
                    ) : (
                     'Add Product'
                   )}
                 </Button>
              </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
