import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/middleware/admin-auth";
import { getAdminProduct, updateAdminProduct } from "@/services/server/adminProductService";

// Handler implementations
async function handleGET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getAdminProduct(params.id);
    
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Error fetching product" },
      { status: 500 }
    );
  }
}

async function handlePATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const updatedProduct = await updateAdminProduct(params.id, data);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Error updating product" },
      { status: 500 }
    );
  }
}

// Export handler functions wrapped with admin auth
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  return withAdminAuth(request, (req) => handleGET(req, context));
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  return withAdminAuth(request, (req) => handlePATCH(req, context));
}