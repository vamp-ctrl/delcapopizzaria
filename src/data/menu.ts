import { Pizza, Drink } from '@/types/menu';

export const pizzas: Pizza[] = [
  {
    id: 'margherita',
    name: 'Margherita',
    description: 'Molho de tomate, mussarela, manjericão fresco e azeite',
    prices: { P: 35, M: 45, G: 55, GG: 70 }
  },
  {
    id: 'calabresa',
    name: 'Calabresa',
    description: 'Molho de tomate, mussarela, calabresa fatiada e cebola',
    prices: { P: 38, M: 48, G: 58, GG: 75 }
  },
  {
    id: 'frango-catupiry',
    name: 'Frango com Catupiry',
    description: 'Molho de tomate, frango desfiado, catupiry e milho',
    prices: { P: 40, M: 52, G: 65, GG: 82 }
  },
  {
    id: 'portuguesa',
    name: 'Portuguesa',
    description: 'Molho, mussarela, presunto, ovos, cebola, ervilha e azeitonas',
    prices: { P: 42, M: 54, G: 68, GG: 85 }
  },
  {
    id: 'quatro-queijos',
    name: 'Quatro Queijos',
    description: 'Mussarela, provolone, gorgonzola e parmesão',
    prices: { P: 45, M: 58, G: 72, GG: 90 }
  },
  {
    id: 'pepperoni',
    name: 'Pepperoni',
    description: 'Molho de tomate, mussarela e pepperoni artesanal',
    prices: { P: 45, M: 58, G: 72, GG: 90 }
  },
  {
    id: 'bacon',
    name: 'Bacon Especial',
    description: 'Molho de tomate, mussarela, bacon crocante e cebola caramelizada',
    prices: { P: 44, M: 56, G: 70, GG: 88 }
  },
  {
    id: 'vegetariana',
    name: 'Vegetariana',
    description: 'Molho, mussarela, tomate, champignon, palmito e brócolis',
    prices: { P: 40, M: 52, G: 65, GG: 82 }
  }
];

export const drinks: Drink[] = [
  { id: 'coca-lata', name: 'Coca-Cola', type: 'refrigerante', price: 6, size: 'Lata 350ml' },
  { id: 'coca-600', name: 'Coca-Cola', type: 'refrigerante', price: 9, size: '600ml' },
  { id: 'coca-2l', name: 'Coca-Cola', type: 'refrigerante', price: 14, size: '2L' },
  { id: 'guarana-lata', name: 'Guaraná Antarctica', type: 'refrigerante', price: 5, size: 'Lata 350ml' },
  { id: 'guarana-2l', name: 'Guaraná Antarctica', type: 'refrigerante', price: 12, size: '2L' },
  { id: 'suco-laranja', name: 'Suco de Laranja', type: 'suco', price: 8, size: '500ml' },
  { id: 'suco-uva', name: 'Suco de Uva', type: 'suco', price: 8, size: '500ml' },
  { id: 'suco-maracuja', name: 'Suco de Maracujá', type: 'suco', price: 8, size: '500ml' },
  { id: 'suco-manga', name: 'Suco de Manga', type: 'suco', price: 8, size: '500ml' }
];
