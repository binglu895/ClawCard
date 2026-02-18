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

export interface Joker {
  id: string;
  name: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  level: number;
  effect: string;
  price: number;
  description: string;
}

export interface Consumable {
  id: string;
  name: string;
  type: 'Planet' | 'Tarot';
  effect: string;
  price: number;
  description: string;
}

export enum GamePhase {
  Gameplay = 'GAMEPLAY',
  Shop = 'SHOP',
  Story = 'STORY'
}

export interface GameState {
  phase: GamePhase;
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
  jokersData: Joker[]; // Active jokers
  consumables: Consumable[];
  ante: number;
  round: number;
  storyProgress: number;
  planetsUsed: number;
  handPlayCounts: Record<string, number>;
}
