

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { PlusCircle, Edit, Trash2, PackageSearch, AlertCircle, Loader2, Star, Search, X } from 'lucide-react';
import { LoadingImage } from '@/components/loading-image';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useSWR from 'swr';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';

interface PaginatedProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const fetcher = async (url: string): Promise<PaginatedProductsResponse> => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await res.json();
    if (!data) {
      return { products: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
    }
    return data;
  } catch (error) {
    // Convert any error to a string message
    throw new Error(error instanceof Error ? error.message : 'Failed to load products');
  }
};

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Construct the API URL with search parameter
  const apiUrl = `/api/products?page=${page}&pageSize=${pageSize}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`;
  const { data, error, isLoading, mutate } = useSWR<PaginatedProductsResponse>(apiUrl, fetcher);
  
  // Extract data from response
  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;
  
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [togglingProductId, setTogglingProductId] = useState<string | null>(null);
  const { toast } = useToast();
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Reset to page 1 when pageSize changes
  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setPage(1);
  };

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setPage(1);
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirmDialog(true);
  };

  const handleBestSellerToggle = async (product: Product) => {
    const newStatus = !product.is_best_seller;
    setTogglingProductId(product.id);
    
    // Optimistically update the UI first
    const previousData = data;
    if (data) {
      await mutate(
        {
          ...data,
          products: data.products.map((p: Product) =>
            p.id === product.id ? { ...p, is_best_seller: newStatus } : p
          )
        },
        false
      );
    }

    try {
      await updateProductBestSellerStatus(product.id, newStatus);
      toast({
        title: "Status Updated",
        description: `"${product.name}" is ${newStatus ? 'now' : 'no longer'} a best seller.`,
      });
    } catch (err) {
      // Revert to previous state on error
      if (previousData) {
        await mutate(previousData, false);
      }
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err instanceof Error ? err.message : "Could not update best seller status.",
      });
      // Revert UI on failure by refetching
      await mutate();
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
      // Optimistically update UI
      if (data) {
        await mutate(
          {
            ...data,
            products: data.products.filter((p: Product) => p.id !== productToDelete.id),
            total: data.total - 1,
            totalPages: Math.ceil((data.total - 1) / pageSize)
          },
          false
        );
      }
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
      // Revert UI on failure by refetching
      await mutate();
    } finally {
      setDeletingProductId(null);
      setProductToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Inventory Management</h1>
          {!isLoading && !error && (
            <p className="text-muted-foreground mt-1">
              {searchQuery 
                ? `Found ${total} product${total !== 1 ? 's' : ''} matching "${searchQuery}"`
                : `Managing ${total} product${total !== 1 ? 's' : ''} across ${totalPages} page${totalPages !== 1 ? 's' : ''}`
              }
            </p>
          )}
        </div>
         <Link href="/admin/inventory/add" className="block">
             <Button>
                 <PlusCircle className="mr-2 h-4 w-4" /> Add Product
             </Button>
         </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Product List</CardTitle>
                <CardDescription>View, add, edit, or delete your products. Use the toggle to mark items as best sellers.</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="pageSize" className="text-sm font-medium">
                  Show:
                </Label>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-20" id="pageSize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>
            </div>
            
            {/* Search Input */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                  </Button>
                )}
              </div>
              {searchQuery && (
                <div className="flex items-center text-sm text-muted-foreground">
                  Searching for: "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
           {error ? (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Products</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
           ) : products.length === 0 && !isLoading ? (
              <Alert className="mb-4">
                <PackageSearch className="h-4 w-4" />
                <AlertTitle>
                  {searchQuery ? 'No Products Match Your Search' : 'No Products Found'}
                </AlertTitle>
                <AlertDescription>
                  {searchQuery 
                    ? `No products found matching "${searchQuery}". Try adjusting your search terms.`
                    : 'There are no products in your inventory. Click the "Add Product" button to add your first product.'
                  }
                </AlertDescription>
              </Alert>
           ) : null}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : products.length === 0 ? null : (
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
              {isLoading ? (
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
                    {searchQuery 
                      ? `No products found matching "${searchQuery}"`
                      : 'No products found. Add your first product!'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative w-16 h-16">
                        <LoadingImage
                          src={product.primary_image_path || '/images/placeholder.png'}
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
                    <TableCell>{product.subcategory}</TableCell>
                    <TableCell>
                        <div className="flex items-center space-x-2">
                           {togglingProductId === product.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                           ) : (
                                <Switch
                                    id={`bestseller-${product.id}`}
                                    checked={product.is_best_seller}
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
                    <TableCell className="text-right">{product.stock_quantity ?? 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Link href={`/admin/inventory/edit/${product.id}`} className="inline-block">
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
          )}
          
          {/* Pagination Controls */}
          {!error && !isLoading && totalPages > 1 && (
            <div className="mt-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <PaginationInfo
                  currentPage={page}
                  pageSize={pageSize}
                  totalItems={total}
                />
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}
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
