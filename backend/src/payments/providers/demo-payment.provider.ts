import { Injectable, Logger } from '@nestjs/common';
import {
  IPaymentProvider,
  PaymentProviderType,
  PaymentInitParams,
  PaymentInitResult,
  CallbackData,
  CallbackVerification,
  PaymentStatusResult,
  RefundParams,
  RefundResult,
} from '../interfaces/payment-provider.interface';

/**
 * Demo Payment Provider
 * 
 * Simulates payment gateway behavior for development and testing.
 * NEVER use this in production - it does not process real payments.
 */
@Injectable()
export class DemoPaymentProvider implements IPaymentProvider {
  private readonly logger = new Logger(DemoPaymentProvider.name);
  readonly providerName = PaymentProviderType.JAZZCASH; // Default, can be overridden

  constructor(providerType?: PaymentProviderType) {
    if (providerType) {
      (this as any).providerName = providerType;
    }
  }

  async initiatePayment(params: PaymentInitParams): Promise<PaymentInitResult> {
    this.logger.log(`[DEMO] Initiating payment for order ${params.orderNumber}`);
    this.logger.log(`[DEMO] Amount: PKR ${params.amount / 100}`);

    // Simulate payment initiation
    const transactionId = `DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // In demo mode, we simulate a redirect URL
    // In reality, this would redirect to the payment gateway
    const redirectUrl = `${params.return_url}?transactionId=${transactionId}&status=success`;

    this.logger.log(`[DEMO] Transaction ID: ${transactionId}`);
    this.logger.log(`[DEMO] Redirect URL: ${redirectUrl}`);

    return {
      success: true,
      redirectUrl,
      transactionId,
    };
  }

  async verifyCallback(data: CallbackData): Promise<CallbackVerification> {
    this.logger.log(`[DEMO] Verifying callback for transaction ${data.transactionId}`);

    // In demo mode, we accept all callbacks as valid
    // In production, this would verify the signature using provider's algorithm
    
    const status = data.rawPayload.status || 'success';
    
    this.logger.log(`[DEMO] Callback status: ${status}`);

    return {
      valid: true,
      transactionId: data.transactionId,
      amount: data.amount,
      status: status as any,
    };
  }

  async checkStatus(transactionId: string): Promise<PaymentStatusResult> {
    this.logger.log(`[DEMO] Checking status for transaction ${transactionId}`);

    // In demo mode, always return completed
    return {
      status: 'completed',
      transactionId,
      gatewayStatus: 'MPay', // Simulated gateway status
    };
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    this.logger.log(`[DEMO] Processing refund for transaction ${params.transactionId}`);
    this.logger.log(`[DEMO] Refund amount: PKR ${params.amount / 100}`);

    // In demo mode, always succeed
    const refundId = `REFUND-${Date.now()}`;

    return {
      success: true,
      refundId,
    };
  }

  isConfigured(): boolean {
    // Demo provider is always configured
    return true;
  }
}
