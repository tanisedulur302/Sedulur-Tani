export interface AddToCartDTO {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemDTO {
  quantity: number;
}

export interface CartItemResponse {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    weight: number;
    image_url?: string | null;
    seller: {
      id: string;
      name: string;
    };
  };
  subtotal: number;
}

export interface CartResponse {
  id: string;
  user_id: string;
  items: CartItemResponse[];
  total_items: number;
  total_price: number;
  created_at: Date;
  updated_at: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
