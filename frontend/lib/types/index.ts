export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "buyer" | "seller";
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  category?: string;
  weight: number;
  price: number;
  stock: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  seller?: User;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  items: CartItem[];
  total_items: number;
  total_price: number;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_each: number;
  total_price: number;
  status: "pending" | "processed" | "shipped" | "completed" | "cancelled";
  product?: Product;
  shipments?: Shipment[];
}

export interface Order {
  id: string;
  checkout_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  price_each: number;
  total_price: number;
  shipping_price: number;
  grand_total: number;
  status:
    | "pending"
    | "paid"
    | "processed"
    | "shipped"
    | "completed"
    | "cancelled"
    | "expired";
  created_at: string;
  updated_at: string;
  product?: Product;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    addresses?: Address[];
  };
  checkout?: {
    id: string;
    status: string;
    grand_total: number;
    shipping_price: number;
    notes?: string | null;
  };
  items?: OrderItem[];
  shipments?: Shipment[];
}

export interface Shipment {
  id: string;
  order_id: string;
  courier_name: string;
  tracking_number?: string;
  status: "packing" | "shipping" | "delivered";
  created_at: string;
  updated_at: string;
}

export interface Checkout {
  id: string;
  user_id: string;
  total_price: number;
  shipping_price: number;
  grand_total: number;
  notes?: string | null;
  status: "pending" | "paid" | "expired";
  created_at: string;
  updated_at: string;
  orders: Order[];
}

export interface Payment {
  id: string;
  checkout_id: string;
  xendit_invoice_id: string;
  transaction_id?: string;
  gross_amount: number;
  payment_method?: string;
  transaction_status: string;
  transaction_time?: string;
  created_at: string;
  updated_at: string;
}

// Shipping Types
export interface Province {
  id: string;
  name: string;
}

export interface Regency {
  id: string;
  provinceId: string;
  name: string;
}

export interface District {
  id: string;
  regencyId: string;
  name: string;
}

export interface ShippingCost {
  cost: number;
  courier: string;
  etd: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination?: PaginationMeta;
}
