

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
import { PlusCircle, Edit, Trash2, PackageSearch, AlertCircle, Loader2, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getProducts, deleteProduct as deleteProductService, updateProductBestSellerStatus } from '@/services/productService';
import type { Product } from '@/types/product';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [togglingProductId, setTogglingProductId] = useState<string | null>(null);
  const { toast } = useToast();
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (err) {
       console.warn("Failed to load products:", err);
       setError(err instanceof Error ? err.message : "An unknown error occurred while fetching products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirmDialog(true);
  };

  const handleBestSellerToggle = async (product: Product) => {
    const newStatus = !product.isBestSeller;
    setTogglingProductId(product.id);
    try {
      await updateProductBestSellerStatus(product.id, newStatus);
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === product.id ? { ...p, isBestSeller: newStatus } : p
        )
      );
      toast({
        title: "Status Updated",
        description: `"${product.name}" is ${newStatus ? 'now' : 'no longer'} a best seller.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err instanceof Error ? err.message : "Could not update best seller status.",
      });
      // Revert UI on failure
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === product.id ? { ...p, isBestSeller: product.isBestSeller } : p
        )
      );
    } finally {
      setTogglingProductId(null);
    }
  };


  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    setDeletingProductId(productToDelete.id);
    setShowDeleteConfirmDialog(false);

    try {
      await deleteProductService(productToDelete.id);
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productToDelete.id));
      toast({
        title: "Product Deleted",
        description: `Product "${productToDelete.name}" has been successfully deleted.`,
      });
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast({
        variant: "destructive",
        title: "Error Deleting Product",
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setDeletingProductId(null);
      setProductToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Inventory Management</h1>
         <Link href="/admin/inventory/add" passHref legacyBehavior>
             <Button>
                 <PlusCircle className="mr-2 h-4 w-4" /> Add Product
             </Button>
         </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>View, add, edit, or delete your products. Use the toggle to mark items as best sellers.</CardDescription>
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
                <TableHead>Category</TableHead>
                <TableHead>Sub-Category</TableHead>
                <TableHead>Best Seller</TableHead>
                <TableHead className="text-right">Price (₹)</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                     <TableRow key={`skeleton-${index}`}>
                       <TableCell><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                       <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                       <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                       <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                       <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                       <TableCell className="text-right"><Skeleton className="h-4 w-12" /></TableCell>
                       <TableCell className="text-right"><Skeleton className="h-4 w-8" /></TableCell>
                       <TableCell className="text-center"><Skeleton className="h-8 w-20" /></TableCell>
                     </TableRow>
                  ))
              ) : !error && products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    No products found. Add your first product!
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative w-16 h-16">
                        <Image
                          src={product.primaryImageUrl || 'https://placehold.co/64x64.png'}
                          alt={product.name}
                          fill // Use fill for responsive fixed size containers
                          sizes="64px" // Provide an accurate size
                          className="rounded-md object-cover"
                          data-ai-hint="product list item"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.subCategory}</TableCell>
                    <TableCell>
                        <div className="flex items-center space-x-2">
                           {togglingProductId === product.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                           ) : (
                                <Switch
                                    id={`bestseller-${product.id}`}
                                    checked={product.isBestSeller}
                                    onCheckedChange={() => handleBestSellerToggle(product)}
                                    aria-label={`Mark ${product.name} as best seller`}
                                    disabled={togglingProductId === product.id}
                                />
                           )}
                           <Label htmlFor={`bestseller-${product.id}`} className="sr-only">
                                Best Seller
                           </Label>
                        </div>
                    </TableCell>
                    <TableCell className="text-right">₹{product.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{product.quantity ?? 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Link href={`/admin/inventory/edit/${product.id}`} passHref legacyBehavior>
                           <Button variant="outline" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openDeleteDialog(product)}
                          disabled={deletingProductId === product.id}
                        >
                          {deletingProductId === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {productToDelete && (
        <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product
                "{productToDelete.name}" and remove its images from storage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteProduct}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deletingProductId === productToDelete.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
