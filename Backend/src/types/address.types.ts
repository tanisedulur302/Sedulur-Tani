export interface CreateAddressDTO {
  label: string;
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  is_default?: boolean;
}

export interface UpdateAddressDTO {
  label?: string;
  recipient_name?: string;
  phone?: string;
  address_line?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  is_default?: boolean;
}

export interface AddressResponse {
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
  created_at: Date;
  updated_at: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
