
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getProducts, recordSaleAndUpdateStock, type Product } from '@/services/productService';
import { Loader2, DollarSign, AlertCircle, PackageSearch } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';

const salesFormSchemaBase = z.object({
  productId: z.string().min(1, { message: "Please select a product." }),
  quantitySold: z.coerce.number().int().min(1, { message: "Quantity sold must be at least 1." }),
});

// We'll refine this schema dynamically based on selected product's stock
type SalesFormValues = z.infer<typeof salesFormSchemaBase>;

export default function SalesPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);
  const [formError, setFormError] = useState<string | null>(null); // For dynamic validation errors

  const form = useForm<SalesFormValues>({
    resolver: zodResolver(
      salesFormSchemaBase.refine(
        (data) => {
          if (selectedProduct && data.quantitySold > selectedProduct.quantity) {
            return false;
          }
          return true;
        },
        {
          message: "Quantity sold cannot exceed available stock.",
          path: ["quantitySold"],
        }
      )
    ),
    defaultValues: {
      productId: '',
      quantitySold: 1,
    },
  });

  const watchedProductId = form.watch('productId');

  useEffect(() => {
    async function loadProducts() {
      setIsLoadingProducts(true);
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error loading products for sales page:", error);
        toast({
          variant: "destructive",
          title: "Error Loading Products",
          description: error instanceof Error ? error.message : "Could not fetch products.",
        });
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadProducts();
  }, [toast]);

  useEffect(() => {
    if (watchedProductId) {
      const product = products.find(p => p.id === watchedProductId);
      setSelectedProduct(product || null);
      form.setValue('quantitySold', 1); // Reset quantity when product changes
      form.trigger('quantitySold'); // Re-validate quantity
    } else {
      setSelectedProduct(null);
    }
  }, [watchedProductId, products, form]);

  const onSubmit: SubmitHandler<SalesFormValues> = async (data) => {
    if (!selectedProduct) {
      setFormError("Please select a product.");
      return;
    }
    if (data.quantitySold > selectedProduct.quantity) {
      form.setError("quantitySold", { type: "manual", message: `Only ${selectedProduct.quantity} items in stock.` });
      return;
    }
    setFormError(null);
    setIsSubmittingSale(true);

    try {
      await recordSaleAndUpdateStock(data.productId, data.quantitySold);
      toast({
        title: "Sale Recorded",
        description: `${data.quantitySold} unit(s) of "${selectedProduct.name}" sold successfully. Stock updated.`,
      });
      // Refresh products list to show updated quantity
      setIsLoadingProducts(true);
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
      // Reset form and selected product
      form.reset({ productId: '', quantitySold: 1 });
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error recording sale:", error);
      toast({
        variant: "destructive",
        title: "Error Recording Sale",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsSubmittingSale(false);
      setIsLoadingProducts(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <DollarSign className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Record Daily Sales</h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>New Sale Entry</CardTitle>
          <CardDescription>Select a product and enter the quantity sold to update inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingProducts && products.length === 0 ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-1/3" />
            </div>
          ) : products.length === 0 && !isLoadingProducts ? (
             <Alert variant="default" className="flex items-center">
                <PackageSearch className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                    <AlertTitle className="font-semibold">No Products Found</AlertTitle>
                    <AlertDescription>
                        There are no products in the inventory to record sales for. Please add products first.
                    </AlertDescription>
                </div>
            </Alert>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingProducts}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id} disabled={product.quantity === 0}>
                              {product.name} (Stock: {product.quantity})
                              {product.quantity === 0 && " - Out of Stock"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedProduct && (
                  <div className="p-4 border rounded-md bg-muted/30 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Selected:</span> {selectedProduct.name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Current Stock:</span> {selectedProduct.quantity}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Price per unit:</span> ₹{selectedProduct.price.toFixed(2)}
                    </p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="quantitySold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Sold</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 5"
                          {...field}
                          disabled={!selectedProduct || selectedProduct.quantity === 0}
                          min="1"
                          max={selectedProduct?.quantity}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {formError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                )}

                {(!form.formState.isValid && form.formState.isSubmitted && Object.keys(form.formState.errors).length > 0 && !isSubmittingSale) && (
                 <Alert variant="destructive" className="mb-4">
                     <AlertCircle className="h-4 w-4" />
                     <AlertTitle>Button Disabled</AlertTitle>
                     <AlertDescription>
                         Please correct the errors. Ensure product is selected, quantity is valid and within stock limits.
                     </AlertDescription>
                 </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isSubmittingSale || !selectedProduct || selectedProduct.quantity === 0 || !form.formState.isValid}
                  className="w-full md:w-auto"
                >
                  {isSubmittingSale ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recording Sale...</>
                  ) : (
                    'Record Sale'
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
