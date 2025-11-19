/**
 * Fee Calculator Utility
 * Client-side fee calculation using cached settings
 * For server-side calculations, use SettingsService directly
 */

interface FeeSettings {
  serviceFeePercentage: number;
  deliveryFeeBase: number;
  deliveryFeeReduced: number;
  freeDeliveryThreshold: number;
  taxPercentage: number;
  taxEnabled: boolean;
}

let cachedSettings: FeeSettings | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60000; // 1 minute

/**
 * Fetch settings from API
 */
async function fetchSettings(): Promise<FeeSettings> {
  const response = await fetch('/api/settings');
  const data = await response.json();
  
  if (!data.success) {
    throw new Error('Failed to fetch settings');
  }
  
  return data.data;
}

/**
 * Get settings with caching
 */
async function getSettings(): Promise<FeeSettings> {
  const now = Date.now();
  
  if (cachedSettings && now - cacheTimestamp < CACHE_TTL) {
    return cachedSettings;
  }
  
  cachedSettings = await fetchSettings();
  cacheTimestamp = now;
  
  return cachedSettings;
}

/**
 * Calculate service fee
 */
export async function calculateServiceFee(subtotal: number): Promise<number> {
  const settings = await getSettings();
  return Math.round(subtotal * settings.serviceFeePercentage);
}

/**
 * Calculate delivery fee
 */
export async function calculateDeliveryFee(subtotal: number): Promise<number> {
  const settings = await getSettings();
  
  if (subtotal >= settings.freeDeliveryThreshold) {
    return settings.deliveryFeeReduced;
  }
  
  return settings.deliveryFeeBase;
}

/**
 * Calculate tax
 */
export async function calculateTax(subtotal: number): Promise<number> {
  const settings = await getSettings();
  
  if (!settings.taxEnabled) {
    return 0;
  }
  
  return Math.round(subtotal * settings.taxPercentage);
}

/**
 * Calculate all fees and total
 */
export async function calculateOrderTotals(
  subtotal: number,
  orderType: 'dine-in' | 'pickup' | 'delivery'
): Promise<{
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  tax: number;
  total: number;
}> {
  const serviceFee = await calculateServiceFee(subtotal);
  const deliveryFee = orderType === 'delivery' ? await calculateDeliveryFee(subtotal) : 0;
  const tax = await calculateTax(subtotal);
  
  const total = subtotal + serviceFee + deliveryFee + tax;
  
  return {
    subtotal,
    serviceFee,
    deliveryFee,
    tax,
    total,
  };
}

/**
 * Clear cache (useful for testing or forcing refresh)
 */
export function clearFeeCache(): void {
  cachedSettings = null;
  cacheTimestamp = 0;
}
