/**
 * Test script to simulate Monnify webhook
 * Usage: npx tsx scripts/test-webhook.ts <orderId> <paymentReference>
 */

import crypto from 'crypto';

const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY || '';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhooks/monnify';

async function testWebhook(orderId: string, paymentReference: string) {
  const payload = {
    transactionReference: `MNFY|${Date.now()}|${Math.random().toString(36).substring(7)}`,
    paymentReference,
    amountPaid: 5000,
    totalPayable: 5000,
    settlementAmount: 4950,
    paidOn: new Date().toISOString(),
    paymentStatus: 'PAID',
    paymentDescription: `Order #${orderId}`,
    currency: 'NGN',
    paymentMethod: 'CARD',
    product: {
      type: 'WEB_SDK',
      reference: paymentReference,
    },
    cardDetails: {
      cardType: 'MASTERCARD',
      last4: '0094',
      bin: '506102',
    },
    accountDetails: null,
    accountPayments: [],
    customer: {
      email: 'test@example.com',
      name: 'Test Customer',
    },
    metaData: {
      orderId,
      orderType: 'dine-in',
    },
  };

  const payloadString = JSON.stringify(payload);
  
  // Generate signature
  const signature = crypto
    .createHmac('sha512', MONNIFY_SECRET_KEY)
    .update(payloadString)
    .digest('hex');

  console.log('Sending webhook to:', WEBHOOK_URL);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'monnify-signature': signature,
    },
    body: payloadString,
  });

  const result = await response.json();
  console.log('\nResponse:', result);
  console.log('Status:', response.status);
}

// Get command line arguments
const orderId = process.argv[2];
const paymentReference = process.argv[3];

if (!orderId || !paymentReference) {
  console.error('Usage: npx tsx scripts/test-webhook.ts <orderId> <paymentReference>');
  console.error('Example: npx tsx scripts/test-webhook.ts 673123abc456 WAWA-673123abc456-1234567890-ABC123');
  process.exit(1);
}

testWebhook(orderId, paymentReference).catch(console.error);
