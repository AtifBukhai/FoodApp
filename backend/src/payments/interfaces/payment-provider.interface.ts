/**
 * Payment Provider Interface
 * 
 * Provider-agnostic interface for payment gateways.
 * All payment providers must implement this interface.
 */

export enum PaymentProviderType {
  JAZZCASH = 'JAZZCASH',
  EASYPAISA = 'EASYPAISA',
}

export enum PaymentMode {
  DEMO = 'demo',
  SANDBOX = 'sandbox',
  LIVE = 'live',
}

export interface PaymentInitParams {
  orderId: string;
  orderNumber: string;
  amount: number; // In paisa (PKR * 100)
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  return_url: string;
}

export interface PaymentInitResult {
  success: boolean;
  redirectUrl?: string;
  formData?: Record<string, string>;
  transactionId?: string;
  error?: string;
}

export interface CallbackData {
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  signature?: string;
  rawPayload: Record<string, any>;
}

export interface CallbackVerification {
  valid: boolean;
  transactionId: string;
  amount: number;
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  error?: string;
}

export interface PaymentStatusResult {
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  gatewayStatus?: string;
}

export interface RefundParams {
  transactionId: string;
  amount: number;
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

export interface IPaymentProvider {
  readonly providerName: PaymentProviderType;
  
  /**
   * Initialize a payment and return redirect URL or form data
   */
  initiatePayment(params: PaymentInitParams): Promise<PaymentInitResult>;
  
  /**
   * Verify callback/webhook signature and extract payment details
   */
  verifyCallback(data: CallbackData): Promise<CallbackVerification>;
  
  /**
   * Check payment status from gateway
   */
  checkStatus(transactionId: string): Promise<PaymentStatusResult>;
  
  /**
   * Process a refund
   */
  refund(params: RefundParams): Promise<RefundResult>;
  
  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean;
}
