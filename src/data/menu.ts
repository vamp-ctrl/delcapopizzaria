import { Pizza, Drink } from '@/types/menu';

export const pizzas: Pizza[] = [
  // SALGADAS
  {
    id: 'del-capo',
    name: 'Del Capo',
    description: 'Molho de tomate, queijo mussarela, requeijão cremoso, milho verde, calabresa fatiada e bacon'
  },
  {
    id: 'strogonoff-carne',
    name: 'Strogonoff de carne',
    description: 'Molho de tomate, queijo mussarela, strogonoff de carne e batata palha',
    isPremium: true,
    premiumPrice: 10
  },
  {
    id: 'strogonoff-frango',
    name: 'Strogonoff de frango',
    description: 'Molho de tomate, queijo mussarela, strogonoff de frango e batata palha'
  },
  {
    id: 'chefe-da-casa',
    name: 'Chefe da Casa',
    description: 'Molho de tomate, queijo mussarela, presunto, frango desfiado, rodelas de tomate, requeijão cremoso, cebola, azeitona e orégano'
  },
  {
    id: 'mussarela',
    name: 'Mussarela',
    description: 'Molho de tomate, queijo mussarela, tomate em rodelas e orégano'
  },
  {
    id: 'frango-queijo',
    name: 'Frango com queijo',
    description: 'Molho de tomate, queijo mussarela, milho verde, frango desfiado e orégano'
  },
  {
    id: 'frango-cheddar',
    name: 'Frango com Cheddar',
    description: 'Molho de tomate, rodelas de tomate, queijo cheddar, frango desfiado e orégano'
  },
  {
    id: 'frango-requeijao',
    name: 'Frango com requeijão cremoso',
    description: 'Molho de tomate, queijo mussarela, requeijão cremoso, frango desfiado, azeitona e orégano'
  },
  {
    id: 'calabresa',
    name: 'Calabresa',
    description: 'Molho de tomate, queijo mussarela, calabresa e orégano'
  },
  {
    id: 'calabresa-acebolada',
    name: 'Calabresa acebolada',
    description: 'Molho de tomate, queijo mussarela, calabresa, cebola e orégano'
  },
  {
    id: 'bacon',
    name: 'Bacon',
    description: 'Molho de tomate, queijo mussarela, bacon e orégano'
  },
  {
    id: 'bacon-acebolado',
    name: 'Bacon acebolado',
    description: 'Molho de tomate, queijo mussarela, bacon, cebola, azeitona e orégano'
  },
  {
    id: 'baiana',
    name: 'Baiana',
    description: 'Molho de tomate, queijo mussarela, calabresa moída, ovo, pimenta calabresa, cebola e orégano'
  },
  {
    id: 'baiana-quente',
    name: 'Baiana quente',
    description: 'Molho de tomate, queijo mussarela, calabresa moída, ovo, pimenta calabresa, pimenta gota, cebola e orégano'
  },
  {
    id: 'palmito',
    name: 'Palmito',
    description: 'Molho de tomate, queijo mussarela, tomate em rodelas, palmito, azeitona e orégano'
  },
  {
    id: 'palmito-prime',
    name: 'Palmito prime',
    description: 'Molho de tomate, queijo mussarela, palmito, catupiry, rodelas de tomate, cebola e orégano'
  },
  {
    id: 'calabresa-cremosa',
    name: 'Calabresa cremosa',
    description: 'Molho de tomate, queijo mussarela, calabresa, requeijão cremoso, cebola, azeitona e orégano'
  },
  {
    id: 'brocolis-bacon',
    name: 'Brócolis com bacon',
    description: 'Molho de tomate, queijo mussarela, brócolis, bacon, cebola e orégano'
  },
  {
    id: 'caipira',
    name: 'Caipira',
    description: 'Molho de tomate, queijo mussarela, frango desfiado, milho, requeijão cremoso, tomate em rodelas e orégano'
  },
  {
    id: 'presunto',
    name: 'Presunto',
    description: 'Molho de tomate, queijo mussarela, presunto, rodelas de tomate, cebola, azeitona e orégano'
  },
  {
    id: 'moda-da-casa',
    name: 'Moda da casa',
    description: 'Molho de tomate, milho verde, tomate em rodelas, queijo mussarela, presunto, bacon, calabresa, frango desfiado, palmito e orégano'
  },
  {
    id: 'portuguesa',
    name: 'Portuguesa',
    description: 'Molho de tomate, queijo mussarela, presunto, ovo, cebola, tomate em rodelas, azeitona e orégano'
  },
  {
    id: 'rucula',
    name: 'Rúcula',
    description: 'Molho de tomate, queijo mussarela, rúcula, tomate em rodelas e orégano'
  },
  {
    id: 'milho',
    name: 'Milho',
    description: 'Molho de tomate, queijo mussarela, milho, azeitona e orégano'
  },
  {
    id: 'mineira',
    name: 'Mineira',
    description: 'Molho de tomate, queijo mussarela, requeijão cremoso, milho e orégano'
  },
  {
    id: 'brasileira',
    name: 'Brasileira',
    description: 'Molho de tomate, queijo mussarela, bacon, cebola, tomate em rodelas e orégano'
  },
  {
    id: 'tropical',
    name: 'Tropical',
    description: 'Molho de tomate, queijo mussarela, frango desfiado, milho, palmito, ovos e orégano'
  },
  {
    id: 'italiana',
    name: 'Italiana',
    description: 'Molho de tomate, queijo mussarela, queijo parmesão, tomate em rodelas, cebola, e orégano'
  },
  {
    id: 'lombinho',
    name: 'Lombinho',
    description: 'Molho de tomate, queijo mussarela, lombinho, cebola, catupiry, azeitona e orégano'
  },
  {
    id: 'lombinho-cremoso',
    name: 'Lombinho cremoso',
    description: 'Molho de tomate, queijo mussarela, queijo parmesão, lombinho, catupiry, rodelas de tomate, cebola e orégano'
  },
  {
    id: 'lombinho-abacaxi',
    name: 'Lombinho com abacaxi',
    description: 'Molho de tomate, queijo mussarela, lombinho, abacaxi, catupiry e orégano'
  },
  {
    id: '2-queijos',
    name: '2 Queijos',
    description: 'Molho de tomate, queijo mussarela, requeijão cremoso e orégano'
  },
  {
    id: '3-queijos',
    name: '3 Queijos',
    description: 'Molho de tomate, queijo mussarela, requeijão cremoso, provolone e orégano'
  },
  {
    id: '4-queijos',
    name: '4 Queijos',
    description: 'Molho de tomate, queijo mussarela, queijo provolone, queijo parmesão, requeijão cremoso, azeitona e orégano'
  },
  {
    id: 'americana',
    name: 'Americana',
    description: 'Molho de tomate, queijo mussarela, bacon, ovo, azeitona e orégano'
  },
  {
    id: 'baiana-especial',
    name: 'Baiana Especial',
    description: 'Molho de tomate, queijo mussarela, calabresa, bacon, pimentão, tomate picado, cebola, pimenta calabresa e orégano'
  },
  {
    id: 'fitness',
    name: 'Fitness',
    description: 'Molho de tomate, queijo mussarela, alho frito, milho verde, palmito e orégano'
  },
  {
    id: 'vegetariana',
    name: 'Vegetariana',
    description: 'Molho de tomate, queijo mussarela, milho verde, pimentão, tomate em rodelas, palmito e orégano'
  },
  {
    id: 'portuguesa-especial',
    name: 'Portuguesa Especial',
    description: 'Molho de tomate, queijo mussarela, presunto, ovo, cebola, tomate em rodelas, pimentão, requeijão cremoso, azeitona e orégano'
  },
  {
    id: 'frango-bacon',
    name: 'Frango com Bacon',
    description: 'Molho de tomate, queijo mussarela, frango desfiado, bacon, azeitona e orégano'
  },
  {
    id: 'frango-batata',
    name: 'Frango com batata',
    description: 'Molho de tomate, queijo mussarela, frango desfiado, requeijão cremoso, batata palha e orégano'
  },
  {
    id: 'pimentao',
    name: 'Pimentão',
    description: 'Molho de tomate, queijo mussarela, ovo, pimentão, cebola, tomate em rodelas e orégano'
  },
  {
    id: 'mexicana',
    name: 'Mexicana',
    description: 'Molho de tomate, queijo mussarela, calabresa ralada, pimentão, cebola, pimenta calabresa, azeitona, pimenta biquinho e orégano'
  },
  {
    id: 'mexicana-especial',
    name: 'Mexicana Especial',
    description: 'Molho de tomate, queijo mussarela, presunto, requeijão cremoso, pimentão, cebola, pimenta calabresa, pimenta biquinho, pimenta gota e orégano'
  },
  {
    id: 'brocolis-especial',
    name: 'Brócolis Especial',
    description: 'Molho de tomate, queijo mussarela, brócolis, bacon, alho frito, tomate em rodelas e orégano'
  },
  {
    id: 'bolonhesa',
    name: 'A Bolonhesa',
    description: 'Molho de tomate, queijo mussarela, carne moída, presunto e orégano'
  },
  {
    id: 'bolonhesa-especial',
    name: 'A Bolonhesa Especial',
    description: 'Molho de tomate, queijo mussarela, carne moída, presunto, tomate, cebola, pimentão e orégano'
  },
  {
    id: 'carne-seca',
    name: 'Carne Seca',
    description: 'Molho de tomate, queijo mussarela, carne seca, requeijão cremoso, orégano'
  },
  {
    id: 'carne-seca-banana',
    name: 'Carne seca com banana',
    description: 'Molho de tomate, queijo mussarela, carne seca, banana, requeijão cremoso, orégano'
  },
  // DOCES
  {
    id: 'banana-canela',
    name: 'Banana com canela',
    description: 'Queijo mussarela, banana, leite condensado e canela'
  },
  {
    id: 'beijinho',
    name: 'Beijinho',
    description: 'Queijo mussarela, leite condensado e coco ralado'
  },
  {
    id: 'pacoca',
    name: 'Paçoca',
    description: 'Queijo mussarela, leite condensado, banana e paçoca'
  },
  {
    id: 'pacoca-amendoim',
    name: 'Paçoca com amendoim',
    description: 'Queijo mussarela, paçoca e amendoim'
  },
  {
    id: 'romeu-julieta',
    name: 'Romeu e Julieta',
    description: 'Queijo mussarela e goiabada'
  },
  {
    id: 'cereja',
    name: 'Cereja',
    description: 'Queijo mussarela, ganache de chocolate, chocolate ao leite e cereja'
  },
  {
    id: 'morango',
    name: 'Morango',
    description: 'Queijo mussarela, ganache de chocolate e morango fatiado',
    isPremium: true,
    premiumPrice: 10
  },
  {
    id: 'prestigio',
    name: 'Prestígio',
    description: 'Queijo mussarela, ganache de chocolate, chocolate ao leite e coco ralado'
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
