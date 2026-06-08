export interface CreateProductDTO {
  name: string;
  description: string;
  category?: string;
  weight: number;
  price: number;
  stock: number;
  image_url?: string;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  category?: string;
  weight?: number;
  price?: number;
  stock?: number;
  image_url?: string;
}

export interface ProductResponse {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  weight: number;
  price: number;
  stock: number;
  image_url?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProductWithSeller extends ProductResponse {
  seller: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
