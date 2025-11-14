import { Metadata } from 'next';
import { OrderTypeSelection } from '@/components/shared/order/order-type-selection';

export const metadata: Metadata = {
  title: 'Select Order Type - Wawa Garden Bar',
  description: 'Choose how you want to receive your order',
};

export default function OrderPage() {
  return <OrderTypeSelection />;
}
