import { Metadata } from "next";
import { getAdminProduct } from "@/services/server/adminProductService";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Edit Product - BeYou Admin",
  description: "Edit product details in the BeYou admin panel",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const product = await getAdminProduct(id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p>The requested product could not be found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm initialData={product} />
    </div>
  );
}

// Use withAdminAuth with both the component and page route
// Protect the page with admin authentication
