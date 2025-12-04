
interface SMSResponse {
  SMSMessageData: {
    Message: string;
    Recipients: Array<{
      number: string;
      status: string;
      cost: string;
      messageId: string;
      statusCode?: number;
    }>;
  };
}

export interface SMSResult {
  success: boolean;
  message?: string;
  errorCode?: string;
  details?: any;
}

/**
 * Africa's Talking SMS Service
 */
export class SMSService {
  private static get username() {
    return process.env.AFRICASTALKING_USERNAME || 'sandbox';
  }

  private static get apiKey() {
    return process.env.AFRICASTALKING_API_KEY;
  }

  private static get senderId() {
    return process.env.AFRICASTALKING_SENDER_ID;
  }

  private static get apiUrl() {
    return process.env.AFRICASTALKING_API_URL || 'https://api.sandbox.africastalking.com/version1/messaging';
  }

  private static get isEnabled() {
    return process.env.ENABLE_SMS_NOTIFICATIONS === 'true';
  }

  /**
   * Send a single or bulk SMS
   */
  static async sendSMS(to: string | string[], message: string): Promise<SMSResult> {
    if (!this.isEnabled) {
      console.warn('SMS service is disabled');
      return {
        success: false,
        message: 'SMS service is currently disabled',
        errorCode: 'SERVICE_DISABLED'
      };
    }

    if (!this.apiKey) {
      console.error('Africa\'s Talking API key is missing');
      return {
        success: false,
        message: 'SMS service is not configured properly',
        errorCode: 'MISSING_API_KEY'
      };
    }

    try {
      const recipientString = Array.isArray(to) ? to.join(',') : to;
      
      // Format phone numbers (ensure they start with +)
      // Africa's Talking requires E.164 format (e.g., +234...)
      // For simplicity, we'll assume the inputs are mostly correct or add + if missing
      const formattedRecipients = recipientString
        .split(',')
        .map(num => num.trim())
        .map(num => num.startsWith('+') ? num : `+${num}`);

      const payload: any = {
        username: this.username,
        phoneNumbers: formattedRecipients,
        message: message
      };

      if (this.senderId && this.senderId !== 'sandbox') {
        payload.from = this.senderId;
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apiKey': this.apiKey,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Africa\'s Talking API Error:', errorText);
        return {
          success: false,
          message: 'Failed to connect to SMS service',
          errorCode: 'API_ERROR',
          details: errorText
        };
      }

      const data: SMSResponse = await response.json();
      const responseRecipients = data.SMSMessageData.Recipients;
      
      // Check for specific failure statuses
      const failedRecipients = responseRecipients.filter(
        r => r.status !== 'Success' && r.status !== 'Queued'
      );

      if (failedRecipients.length > 0) {
        const firstFailure = failedRecipients[0];
        console.warn('SMS delivery failed:', data.SMSMessageData);
        
        // Handle specific error cases
        if (firstFailure.status === 'DoNotDisturbRejection') {
          return {
            success: false,
            message: 'This phone number cannot receive SMS messages. It may be on a Do Not Disturb list or in sandbox mode without registration.',
            errorCode: 'DND_REJECTION',
            details: data.SMSMessageData
          };
        }
        
        if (firstFailure.status === 'InvalidPhoneNumber') {
          return {
            success: false,
            message: 'The phone number format is invalid',
            errorCode: 'INVALID_PHONE',
            details: data.SMSMessageData
          };
        }
        
        if (firstFailure.status === 'InsufficientBalance') {
          return {
            success: false,
            message: 'SMS service has insufficient balance',
            errorCode: 'INSUFFICIENT_BALANCE',
            details: data.SMSMessageData
          };
        }
        
        // Generic failure
        return {
          success: false,
          message: `SMS delivery failed: ${firstFailure.status}`,
          errorCode: 'DELIVERY_FAILED',
          details: data.SMSMessageData
        };
      }

      return {
        success: true,
        message: 'SMS sent successfully'
      };
    } catch (error) {
      console.error('SMS Service Error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred while sending SMS',
        errorCode: 'UNKNOWN_ERROR',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Send Verification PIN
   */
  static async sendVerificationPinSMS(phone: string, pin: string): Promise<SMSResult> {
    const message = `Your Wawa Garden Bar verification PIN is: ${pin}. Do not share this code. Expires in 10 mins.`;
    return this.sendSMS(phone, message);
  }

  /**
   * Send Order Confirmation
   */
  static async sendOrderConfirmationSMS(
    phone: string, 
    orderNumber: string, 
    total: number,
    estimatedTime?: number
  ): Promise<SMSResult> {
    let message = `Order #${orderNumber} confirmed! Total: N${total.toLocaleString()}.`;
    if (estimatedTime) {
      message += ` Est. wait: ${estimatedTime} mins.`;
    }
    message += ` Track at Wawa Garden Bar.`;
    return this.sendSMS(phone, message);
  }

  /**
   * Send Order Status Update
   */
  static async sendOrderStatusSMS(
    phone: string, 
    orderNumber: string, 
    status: string
  ): Promise<SMSResult> {
    const statusMap: Record<string, string> = {
      'preparing': 'is being prepared 👨‍🍳',
      'ready': 'is ready! 🎉',
      'out-for-delivery': 'is out for delivery 🚗',
      'delivered': 'has been delivered ✅',
      'cancelled': 'was cancelled ❌'
    };

    const statusText = statusMap[status] || `is ${status.replace('-', ' ')}`;
    const message = `Update: Your Order #${orderNumber} ${statusText}. Wawa Garden Bar`;
    return this.sendSMS(phone, message);
  }
}
