export interface CreatePaymentDTO {
  checkout_id: string;
}

export interface CreatePaymentResponse {
  invoice_url?: string;
  invoice_id: string;
  transaction_id: string;
}

export interface PaymentStatusResponse {
  checkout_id: string;
  transaction_id: string;
  transaction_status: string;
  payment_method?: string;
  gross_amount: number;
  transaction_time?: Date;
}

export interface XenditInvoiceCallback {
  id: string;
  external_id: string;
  user_id: string;
  status: string;
  merchant_name: string;
  merchant_profile_picture_url: string;
  amount: number;
  paid_amount?: number;
  bank_code?: string;
  paid_at?: string;
  payer_email?: string;
  description?: string;
  adjusted_received_amount?: number;
  fees_paid_amount?: number;
  updated: string;
  created: string;
  currency: string;
  payment_method: string;
  payment_channel?: string;
  payment_destination?: string;
}
