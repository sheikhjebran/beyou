'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, PackageSearch, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link'; // Import Link
import { getProducts } from '@/services/productService'; // Import service function
import type { Product } from '@/types/product';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Placeholder for Add/Edit Modal/Dialog component
// import ProductFormDialog from './product-form-dialog';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
      } catch (err) {
         console.error("Failed to load products:", err);
         setError(err instanceof Error ? err.message : "An unknown error occurred while fetching products.");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // const handleAddProduct = () => {
  //   setSelectedProduct(null); // Clear selection for adding new
  //   setIsDialogOpen(true);
  // };

  // const handleEditProduct = (product: Product) => {
  //   setSelectedProduct(product);
  //   setIsDialogOpen(true);
  // };

  // const handleDeleteProduct = async (productId: string) => {
  //   // Implement delete logic using deleteProduct service
  //   if (window.confirm('Are you sure you want to delete this product?')) {
  //     try {
  //       // await deleteProduct(productId);
  //       console.log(`Deleting product ${productId} (placeholder)`);
  //       // Refresh product list after deletion
  //       setProducts(products.filter(p => p.id !== productId));
  //       // Show success toast
  //     } catch (err) {
  //       console.error("Failed to delete product:", err);
  //       // Show error toast
  //     }
  //   }
  // };

  // const handleDialogClose = (refresh?: boolean) => {
  //   setIsDialogOpen(false);
  //   setSelectedProduct(null);
  //   if (refresh) {
  //     // Trigger data refresh
  //      async function loadProducts() {
  //       setLoading(true);
  //        setError(null);
  //        try {
  //          const fetchedProducts = await getProducts();
  //          setProducts(fetchedProducts);
  //        } catch (err) {
  //          console.error("Failed to load products:", err);
  //          setError(err instanceof Error ? err.message : "An unknown error occurred while fetching products.");
  //        } finally {
  //         setLoading(false);
  //       }
  //      }
  //     loadProducts();
  //   }
  // };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Inventory Management</h1>
         <Link href="/admin/inventory/add" passHref legacyBehavior>
             <Button>
                 <PlusCircle className="mr-2 h-4 w-4" /> Add Product
             </Button>
         </Link>

        {/* <Button onClick={handleAddProduct}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Product
        </Button> */}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>View, add, edit, or delete your products.</CardDescription>
        </CardHeader>
        <CardContent>
           {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Products</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
           )}
          <Table>
            <TableCaption>A list of your products.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Price (₹)</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 // Skeleton Loader Rows
                  Array.from({ length: 5 }).map((_, index) => (
                     <TableRow key={`skeleton-${index}`}>
                       <TableCell><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                       <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                       <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                       <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                       <TableCell className="text-right"><Skeleton className="h-4 w-12" /></TableCell>
                       <TableCell className="text-right"><Skeleton className="h-4 w-8" /></TableCell>
                       <TableCell className="text-center"><Skeleton className="h-8 w-20" /></TableCell>
                     </TableRow>
                  ))
              ) : !error && products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    No products found. Add your first product!
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Image
                        src={product.imageUrl || 'https://picsum.photos/seed/placeholder/64/64'}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.type}</TableCell>
                    <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                    <TableCell className="text-right">₹{product.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{product.quantity ?? 'N/A'}</TableCell> {/* Handle potentially missing quantity */}
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Link href={`/admin/inventory/edit/${product.id}`} passHref legacyBehavior>
                           <Button variant="outline" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                        </Link>

                        {/* <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEditProduct(product)}>
                           <Edit className="h-4 w-4" />
                           <span className="sr-only">Edit</span>
                         </Button> */}
                        {/* <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

       {/* Placeholder for Dialog/Modal */}
       {/* {isDialogOpen && (
         <ProductFormDialog
           product={selectedProduct}
           onClose={handleDialogClose}
         />
       )} */}
    </div>
  );
}
