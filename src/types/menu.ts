export type PizzaSize = 'P' | 'M' | 'G' | 'GG';

export interface Pizza {
  id: string;
  name: string;
  description: string;
  prices: Record<PizzaSize, number>;
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
}
