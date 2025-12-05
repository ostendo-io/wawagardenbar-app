'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/stores/cart-store';

interface TableNumberSetterProps {
  tableNumber?: string;
}

export function TableNumberSetter({ tableNumber }: TableNumberSetterProps) {
  const setTableNumber = useCartStore((state) => state.setTableNumber);

  useEffect(() => {
    if (tableNumber) {
      console.log('Setting table number from URL:', tableNumber);
      setTableNumber(tableNumber);
    }
  }, [tableNumber, setTableNumber]);

  return null;
}
