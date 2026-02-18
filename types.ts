export type Suit = 'HEARTS' | 'SPADES' | 'DIAMONDS' | 'CLUBS';

export enum Enhancement { None = 'None', Stone = 'Stone', Steel = 'Steel', Gold = 'Gold', Glass = 'Glass' }
export enum Edition { None = 'None', Foil = 'Foil', Holographic = 'Holographic', Polychrome = 'Polychrome' }
export enum Seal { None = 'None', Red = 'Red', Blue = 'Blue', Gold = 'Gold', Purple = 'Purple' }

export type PokerHand =
  | 'High Card'
  | 'Pair'
  | 'Two Pair'
  | 'Three of a Kind'
  | 'Straight'
  | 'Flush'
  | 'Full House'
  | 'Four of a Kind'
  | 'Five of a Kind'
  | 'Straight Flush'
  | 'Royal Flush';

export interface CardData {
  id: string;
  rank: string;
  suit: Suit;
  enhancement: Enhancement;
  edition: Edition;
  seal: Seal;
}

export interface HandLevelEntry {
  hand: PokerHand;
  level: number;
}

export interface GameState {
  currentBlind: string;
  score: number;
  goal: number;
  chips: number; // For the current hand calculation
  mult: number;  // For the current hand calculation
  handsLeft: number;
  discardsLeft: number;
  money: number;
  pokerHand: PokerHand;
  level: number;
  handLevels: Record<PokerHand, number>;
  cards: CardData[];
  deck: CardData[];
  jokers: string[]; // Joker IDs
  ante: number;
  round: number;
}
