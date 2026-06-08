import { CheckoutStatus, OrderStatus } from "@prisma/client";

export interface CreateCheckoutDTO {
  address_id: string;
  shipping_method?: string;
  notes?: string;
}

export interface CheckoutOrderResponse {
  id: string;
  checkout_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  price_each: number;
  total_price: number;
  status: OrderStatus;
  product: {
    id: string;
    name: string;
    weight: number;
    image_url?: string | null;
  };
}

export interface CheckoutResponse {
  id: string;
  user_id: string;
  address: {
    id: string;
    label: string;
    recipient_name: string;
    phone: string;
    address_line: string;
    city: string;
    province: string;
    postal_code: string;
  };
  orders: CheckoutOrderResponse[];
  total_price: number;
  shipping_price: number;
  grand_total: number;
  shipping_method: string;
  notes?: string | null;
  status: CheckoutStatus;
  created_at: Date;
  updated_at: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
