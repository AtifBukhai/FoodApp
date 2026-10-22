import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
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
 * JazzCash Payment Provider
 * 
 * Integration with JazzCash payment gateway for Pakistan.
 * 
 * IMPORTANT: This is a structural implementation. To use in production:
 * 1. Obtain merchant credentials from JazzCash
 * 2. Configure sandbox/live environment
 * 3. Verify API endpoints match current JazzCash documentation
 * 4. Test thoroughly in sandbox before going live
 * 
 * JazzCash Documentation: https://sandbox.jazzcash.com.pk/MerchantDocument
 */
@Injectable()
export class JazzCashProvider implements IPaymentProvider {
  private readonly logger = new Logger(JazzCashProvider.name);
  readonly providerName = PaymentProviderType.JAZZCASH;

  private readonly sandbox: boolean;
  private readonly merchantId: string;
  private readonly password: string;
  private readonly integritySalt: string;
  private readonly returnUrl: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.sandbox = this.configService.get<string>('JAZZCASH_SANDBOX', 'true') === 'true';
    this.merchantId = this.configService.get<string>('JAZZCASH_MERCHANT_ID', '');
    this.password = this.configService.get<string>('JAZZCASH_PASSWORD', '');
    this.integritySalt = this.configService.get<string>('JAZZCASH_INTEGRITY_SALT', '');
    this.returnUrl = this.configService.get<string>('JAZZCASH_RETURN_URL', '');
    
    this.baseUrl = this.sandbox
      ? 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/'
      : 'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/';
  }

  /**
   * Generate JazzCash signature using HMAC-SHA256
   * 
   * Signature format: IntegritySalt + '&' + sorted_params_string
   */
  private generateSignature(params: Record<string, string>): string {
    // Sort parameters alphabetically
    const sortedKeys = Object.keys(params).sort();
    const sortedParams = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
    
    // Create signature string
    const signatureString = `${this.integritySalt}&${sortedParams}`;
    
    // Generate HMAC-SHA256
    return crypto
      .createHmac('sha256', this.password)
      .update(signatureString)
      .digest('hex')
      .toUpperCase();
  }

  async initiatePayment(params: PaymentInitParams): Promise<PaymentInitResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'JazzCash provider not configured. Missing merchant credentials.',
      };
    }

    this.logger.log(`Initiating JazzCash payment for order ${params.orderNumber}`);

    try {
      // Prepare request parameters
      const pp_Amount = params.amount.toString(); // Amount in paisa
      const pp_BillReference = params.orderNumber;
      const pp_Description = `Order ${params.orderNumber}`;
      const pp_Language = 'EN';
      const pp_MerchantID = this.merchantId;
      const pp_Password = this.password;
      const pp_ReturnURL = this.returnUrl;
      const pp_TxnDateTime = this.formatJazzCashDateTime(new Date());
      const pp_TxnExpiryDateTime = this.formatJazzCashDateTime(
        new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours expiry
      );
      const pp_TxnRefNo = `T${Date.now()}`;
      const pp_TxnType = 'MWALLET';
      const pp_Version = '1.1';
      
      // Customer info
      const pp_CustomerEmailAddress = params.customerEmail;
      const pp_CustomerMobile = params.customerPhone;

      // Build parameters object
      const requestParams: Record<string, string> = {
        pp_Amount,
        pp_BillReference,
        pp_Description,
        pp_Language,
        pp_MerchantID,
        pp_Password,
        pp_ReturnURL,
        pp_TxnDateTime,
        pp_TxnExpiryDateTime,
        pp_TxnRefNo,
        pp_TxnType,
        pp_Version,
        pp_CustomerEmailAddress,
        pp_CustomerMobile,
      };

      // Generate signature
      const pp_SecureHash = this.generateSignature(requestParams);

      // Add signature to params
      requestParams.pp_SecureHash = pp_SecureHash;

      // JazzCash uses POST form submission
      const redirectUrl = `${this.baseUrl}paymentInstrument`;

      this.logger.log(`JazzCash payment initiated. Transaction: ${pp_TxnRefNo}`);

      return {
        success: true,
        redirectUrl,
        formData: requestParams,
        transactionId: pp_TxnRefNo,
      };
    } catch (error) {
      this.logger.error(`Failed to initiate JazzCash payment: ${error.message}`);
      return {
        success: false,
        error: `Payment initiation failed: ${error.message}`,
      };
    }
  }

  async verifyCallback(data: CallbackData): Promise<CallbackVerification> {
    this.logger.log(`Verifying JazzCash callback for transaction ${data.transactionId}`);

    try {
      const payload = data.rawPayload;

      // Extract required fields
      const pp_Amount = payload.pp_Amount;
      const pp_BillReference = payload.pp_BillReference;
      const pp_ResponseCode = payload.pp_ResponseCode;
      const pp_RetreivalReference = payload.pp_RetreivalReference;
      const pp_SecureHash = payload.pp_SecureHash;
      const pp_TxnRefNo = payload.pp_TxnRefNo;

      // Verify signature
      const expectedSignature = this.generateSignature(payload);
      const signatureValid = pp_SecureHash === expectedSignature;

      if (!signatureValid) {
        this.logger.error('JazzCash callback signature verification failed');
        return {
          valid: false,
          transactionId: data.transactionId,
          amount: data.amount,
          status: 'failed',
          error: 'Invalid signature',
        };
      }

      // Check response code (414 = success in JazzCash)
      const isSuccess = pp_ResponseCode === '414';
      
      // Verify amount matches
      const amountMatches = parseInt(pp_Amount) === data.amount;

      if (!amountMatches) {
        this.logger.error(`JazzCash amount mismatch: expected ${data.amount}, got ${pp_Amount}`);
        return {
          valid: false,
          transactionId: data.transactionId,
          amount: data.amount,
          status: 'failed',
          error: 'Amount mismatch',
        };
      }

      return {
        valid: true,
        transactionId: pp_TxnRefNo,
        amount: parseInt(pp_Amount),
        status: isSuccess ? 'success' : 'failed',
      };
    } catch (error) {
      this.logger.error(`JazzCash callback verification failed: ${error.message}`);
      return {
        valid: false,
        transactionId: data.transactionId,
        amount: data.amount,
        status: 'failed',
        error: `Verification failed: ${error.message}`,
      };
    }
  }

  async checkStatus(transactionId: string): Promise<PaymentStatusResult> {
    this.logger.log(`Checking JazzCash status for transaction ${transactionId}`);

    // Note: JazzCash doesn't provide a direct status check API
    // Status is determined via callback/webhook
    // This would need to query the Payment record in database
    
    return {
      status: 'pending',
      transactionId,
      gatewayStatus: 'Pending',
    };
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    this.logger.log(`Processing JazzCash refund for transaction ${params.transactionId}`);

    // Note: JazzCash refund API would be implemented here
    // This requires additional merchant permissions
    
    return {
      success: false,
      error: 'JazzCash refunds not yet implemented. Contact support.',
    };
  }

  isConfigured(): boolean {
    return !!(
      this.merchantId &&
      this.password &&
      this.integritySalt &&
      this.returnUrl
    );
  }

  /**
   * Format date for JazzCash: dd/mm/yyyy HH:MM:SS
   */
  private formatJazzCashDateTime(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    
    return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
  }
}
