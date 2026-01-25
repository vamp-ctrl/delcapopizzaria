export type PizzaSize = 'P' | 'M' | 'G' | 'GG';

export interface Pizza {
  id: string;
  name: string;
  description: string;
  isPremium?: boolean; // Sabores premium têm custo adicional
  premiumPrice?: number; // Valor adicional do sabor premium
  image?: string;
}

export interface Drink {
  id: string;
  name: string;
  type: 'refrigerante' | 'suco';
  price: number;
  size: string;
}

export interface CartItem {
  id: string;
  type: 'pizza' | 'drink' | 'combo';
  name: string;
  size?: PizzaSize | string;
  price: number;
  quantity: number;
  flavors?: string[];
  border?: string;
  borderPrice?: number;
  freeDelivery?: boolean;
}

export interface BorderOption {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
  display_order: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_uses: number | null;
  uses_count: number;
  is_active: boolean;
  expires_at: string | null;
}

export interface Combo {
  id: string;
  name: string;
  description: string | null;
  regular_price: number;
  combo_price: number;
  is_active: boolean;
  image_url: string | null;
  items?: ComboItem[];
}

export interface ComboItem {
  id: string;
  combo_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
}

export const MAX_FLAVORS: Record<PizzaSize, number> = {
  'P': 2,
  'M': 2,
  'G': 3,
  'GG': 3
};

// Preços fixos por tamanho
export const SIZE_PRICES: Record<PizzaSize, number> = {
  'P': 47,
  'M': 63,
  'G': 78,
  'GG': 85
};
