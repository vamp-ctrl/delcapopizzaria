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
  type: 'pizza' | 'drink';
  name: string;
  size?: PizzaSize | string;
  price: number;
  quantity: number;
  flavors?: string[]; // Added for pizza flavors
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
