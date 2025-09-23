// Product-related interfaces
export interface DbProduct {
    id: string;               // varchar(36)
    name: string;            // varchar(255)
    description: string | null;     // text
    price: number;           // decimal(10,2)
    stock_quantity: number;  // int(11)
    category: string;        // varchar(100)
    subcategory: string | null;    // varchar(100)
    primary_image_path: string | null;  // varchar(255)
    is_best_seller: number;      // tinyint(1)
    created_at: Date;     // timestamp
    updated_at: Date;     // timestamp
}

export interface DbProductImage {
    id: string;              // varchar(36)
    product_id: string;      // varchar(36)
    image_path: string;      // varchar(255)
    is_primary: number;      // tinyint(1)
    created_at: Date;        // timestamp
    updated_at: Date;        // timestamp
}

// User-related interfaces
export interface DbUser {
    id: string;               // varchar(36)
    email: string;           // varchar(255)
    password_hash: string;   // varchar(255)
    display_name: string | null;  // varchar(100)
    profile_image_path: string | null;  // varchar(255)
    role: 'admin' | 'user';  // enum('admin','user')
    created_at: Date;        // timestamp
    updated_at: Date;        // timestamp
}

export interface DbAdminUser {
    id: string;          // varchar(36)
    email: string;       // varchar(255)
    password: string;    // varchar(255)
    role: string;        // varchar(50)
    created_at: Date;    // timestamp
    updated_at: Date;    // timestamp
}

// Content-related interfaces
export interface DbBanner {
    id: string;             // varchar(36)
    title: string | null;   // varchar(255)
    subtitle: string | null; // text
    image_path: string;     // varchar(255)
    created_at: Date;       // timestamp
    updated_at: Date;       // timestamp
}

export interface DbCategoryImage {
    id: string;           // varchar(36)
    category_name: string; // varchar(100)
    image_path: string;   // varchar(255)
    created_at: Date;     // timestamp
    updated_at: Date;     // timestamp
}

// Sales-related interfaces
export interface DbSale {
    id: string;                  // varchar(36)
    product_id: string;          // varchar(36)
    quantity_sold: number;       // int(11)
    sale_price_per_unit: number; // decimal(10,2)
    total_amount: number;        // decimal(10,2)
    sale_date: Date;            // timestamp
}
