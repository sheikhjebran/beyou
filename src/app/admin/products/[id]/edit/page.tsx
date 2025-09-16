import { Metadata } from "next";
import { withAdminAuth } from "@/middleware/admin-auth";
import { getAdminProduct } from "@/services/server/adminProductService";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Edit Product - BeYou Admin",
  description: "Edit product details in the BeYou admin panel",
};

interface EditProductPageProps {
  params: {
    id: string;
  };
}

async function EditProductPage({ params }: EditProductPageProps) {
  const product = await getAdminProduct(params.id);

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
export default async function Page({ params }: EditProductPageProps) {
  return EditProductPage({ params });
}