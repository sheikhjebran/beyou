export interface AddProductData {
    name: string;
    category: string;
    subCategory?: string;
    description: string;
    price: number;
    stock_quantity: number;
    imageFiles: File[];
    primaryImageIndex: number;
}
