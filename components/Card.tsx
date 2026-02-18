import React from 'react';
import { CardData, Suit, Enhancement, Edition, Seal } from '../types';

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

const getEditionClass = (edition: Edition) => {
  switch (edition) {
    case Edition.Foil: return 'shadow-[0_0_15px_rgba(37,140,244,0.4)] border border-blue-400/30';
    case Edition.Holographic: return 'shadow-[0_0_15px_rgba(255,77,255,0.4)] border border-pink-400/30';
    case Edition.Polychrome: return 'animate-pulse shadow-[0_0_15px_rgba(255,255,77,0.4)] border border-yellow-400/30';
    default: return '';
  }
};

const getEnhancementLabel = (enh: Enhancement) => {
  if (enh === Enhancement.None) return null;
  return <div className="absolute top-1/2 left-0 w-full text-center text-[8px] font-bold opacity-30 pointer-events-none uppercase tracking-widest">{enh}</div>;
};

export const Card: React.FC<CardProps> = ({ card, isSelected, onToggleSelect }) => {
  return (
    <div
      onClick={() => onToggleSelect(card.id)}
      className={`
        w-36 h-52 rounded-lg flex flex-col p-3 text-background-dark 
        cursor-pointer shadow-2xl transition-all duration-300 ease-out select-none relative
        ${card.enhancement === Enhancement.Stone ? 'bg-zinc-600 text-white' : 'bg-card-white'}
        ${getEditionClass(card.edition)}
        ${isSelected ? 'transform -translate-y-10 border-2 border-primary' : 'hover:-translate-y-4'}
      `}
    >
      <div className="flex justify-between items-start">
        <span className={`material-symbols-outlined text-sm ${getSuitColorClass(card.suit)}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {getSuitIcon(card.suit)}
        </span>
        {card.edition !== Edition.None && <span className="text-[10px] font-bold text-zinc-400 italic uppercase">{card.edition}</span>}
      </div>

      {getEnhancementLabel(card.enhancement)}

      <div className="flex-1 flex items-center justify-center">
        <span className="text-6xl font-bold tracking-tighter tabular-nums">
          {card.enhancement === Enhancement.Stone ? '' : card.rank}
        </span>
      </div>

      <div className="flex justify-between items-end">
        <div className="text-[10px] font-bold text-zinc-400">
          {card.suit}
        </div>
        {card.seal !== Seal.None && (
          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white
            ${card.seal === Seal.Red ? 'bg-mult-red' : card.seal === Seal.Blue ? 'bg-primary' : card.seal === Seal.Gold ? 'bg-yellow-500' : 'bg-purple-500'}`}>
            S
          </div>
        )}
      </div>
    </div>
  );
};
