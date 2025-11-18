/**
 * Test script to verify payment status
 * Usage: npx tsx scripts/verify-payment.ts <paymentReference>
 */

async function verifyPayment(paymentReference: string) {
  const API_URL = process.env.API_URL || 'http://localhost:3000';
  
  console.log('Verifying payment:', paymentReference);
  
  const response = await fetch(`${API_URL}/api/payment/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentReference }),
  });

  const result = await response.json();
  console.log('\nVerification Result:');
  console.log(JSON.stringify(result, null, 2));
}

const paymentReference = process.argv[2];

if (!paymentReference) {
  console.error('Usage: npx tsx scripts/verify-payment.ts <paymentReference>');
  console.error('Example: npx tsx scripts/verify-payment.ts WAWA-673123abc456-1234567890-ABC123');
  process.exit(1);
}

verifyPayment(paymentReference).catch(console.error);
