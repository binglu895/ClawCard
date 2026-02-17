
import React from 'react';
import { CardData, Suit } from '../types';

interface CardProps {
  card: CardData;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

const getSuitIcon = (suit: Suit) => {
  switch (suit) {
    case 'HEARTS': return 'favorite';
    case 'SPADES': return 'spa';
    case 'DIAMONDS': return 'diamond';
    case 'CLUBS': return 'poker_chip';
  }
};

const getSuitColorClass = (suit: Suit) => {
  return (suit === 'HEARTS' || suit === 'DIAMONDS') ? 'text-mult-red' : 'text-zinc-800';
};

export const Card: React.FC<CardProps> = ({ card, isSelected, onToggleSelect }) => {
  return (
    <div
      onClick={() => onToggleSelect(card.id)}
      className={`
        w-36 h-52 bg-card-white rounded-lg flex flex-col p-3 text-background-dark 
        cursor-pointer shadow-2xl transition-all duration-300 ease-out select-none
        ${isSelected ? 'transform -translate-y-10 border-2 border-primary' : 'hover:-translate-y-4'}
      `}
    >
      <div className="flex justify-between items-start">
        <span className={`material-symbols-outlined text-sm ${getSuitColorClass(card.suit)}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {getSuitIcon(card.suit)}
        </span>
        {card.isFoil && <span className="text-[10px] font-bold text-zinc-400 italic">FOIL</span>}
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <span className="text-6xl font-bold tracking-tighter tabular-nums">
          {card.rank}
        </span>
      </div>
      
      <div className="text-[10px] font-bold text-zinc-400 self-end">
        {card.suit}
      </div>
    </div>
  );
};
