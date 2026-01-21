import { Pizza, Drink } from '@/types/menu';

export const pizzas: Pizza[] = [
  {
    id: 'margherita',
    name: 'Margherita',
    description: 'Molho de tomate, mussarela, manjericão fresco e azeite'
  },
  {
    id: 'calabresa',
    name: 'Calabresa',
    description: 'Molho de tomate, mussarela, calabresa fatiada e cebola'
  },
  {
    id: 'frango-catupiry',
    name: 'Frango com Catupiry',
    description: 'Molho de tomate, frango desfiado, catupiry e milho'
  },
  {
    id: 'portuguesa',
    name: 'Portuguesa',
    description: 'Molho, mussarela, presunto, ovos, cebola, ervilha e azeitonas'
  },
  {
    id: 'quatro-queijos',
    name: 'Quatro Queijos',
    description: 'Mussarela, provolone, gorgonzola e parmesão'
  },
  {
    id: 'pepperoni',
    name: 'Pepperoni',
    description: 'Molho de tomate, mussarela e pepperoni artesanal'
  },
  {
    id: 'bacon',
    name: 'Bacon Especial',
    description: 'Molho de tomate, mussarela, bacon crocante e cebola caramelizada'
  },
  {
    id: 'vegetariana',
    name: 'Vegetariana',
    description: 'Molho, mussarela, tomate, champignon, palmito e brócolis'
  },
  {
    id: 'strogonoff-carne',
    name: 'Strogonoff de Carne',
    description: 'Molho de tomate, mussarela, strogonoff de carne e batata palha',
    isPremium: true,
    premiumPrice: 10
  },
  {
    id: 'carne-seca',
    name: 'Carne Seca',
    description: 'Molho de tomate, mussarela, carne seca desfiada, cebola e catupiry',
    isPremium: true,
    premiumPrice: 10
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
