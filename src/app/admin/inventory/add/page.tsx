'use client';

import React, { useState } from 'react';
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

// Define Zod schema for validation
const productFormSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters." }),
  type: z.enum(['Beauty', 'Clothing'], { required_error: "Please select a product type." }),
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

   const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      type: undefined,
      description: '',
      price: 0,
      quantity: 0,
      imageFile: null,
    },
  });

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

                {/* Product Type */}
                 <FormField
                   control={form.control}
                   name="type"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Product Type</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Product Image (Optional)</FormLabel>
                       <FormControl>
                          {/* Use a basic file input, ShadCN doesn't have a dedicated one yet */}
                           <Input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              onChange={handleFileChange} // Use custom handler
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


                 <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
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
