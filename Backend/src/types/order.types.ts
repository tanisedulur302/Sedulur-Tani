import { OrderStatus, ShipmentStatus } from "@prisma/client";

export interface ShipmentResponse {
  id: string;
  order_id: string;
  courier_name: string;
  tracking_number: string | null;
  status: ShipmentStatus;
  created_at: Date;
  updated_at: Date;
}

export interface UserAddressResponse {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
}

export interface OrderResponse {
  id: string;
  checkout_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  price_each: number;
  total_price: number;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    addresses?: UserAddressResponse[];
  };
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    image_url: string | null;
    seller?: {
      id: string;
      name: string;
      email: string;
    };
  };
  checkout?: {
    id: string;
    status: string;
    grand_total: number;
    shipping_price: number;
  };
  shipments?: ShipmentResponse[];
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  courier_name?: string;
  tracking_number?: string;
}

export interface OrderListResponse {
  orders: OrderResponse[];
  total: number;
}
