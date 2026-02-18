export type Suit = 'HEARTS' | 'SPADES' | 'DIAMONDS' | 'CLUBS';

export enum Enhancement { None = 'None', Stone = 'Stone', Steel = 'Steel', Gold = 'Gold', Glass = 'Glass', Wild = 'Wild', Mult = 'Mult', Bonus = 'Bonus' }
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
  slot: 'Head' | 'Hand' | 'Leg' | 'Body' | 'Accessory';
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
  Story = 'STORY',
  Event = 'EVENT',
  Ending = 'ENDING'
}

export interface GameState {
  phase: GamePhase;
  currentBlind: string;
  tao: number;      // Previously score
  goal: number;
  chips: number;     // For current hand calculation
  mult: number;      // For current hand calculation
  handsLeft: number;
  discardsLeft: number;
  spiritStones: number; // Previously money
  pokerHand: PokerHand;
  level: number;
  handLevels: Record<PokerHand, number>;
  cards: CardData[];
  deck: CardData[];
  equipment: Record<'Head' | 'Hand' | 'Leg' | 'Body' | 'Accessory', Joker | null>;
  consumables: Consumable[];
  ante: number;
  year: number;     // Previously round
  storyProgress: number;
  planetsUsed: number;
  handPlayCounts: Record<string, number>;
  karma: number;      // Phase 3: Good/Evil
  obsession: number;  // Phase 3: Madness
  reputation: number; // Phase 3: Fame
}

export interface Choice {
  label: string;
  effect: (state: GameState) => Partial<GameState>;
  description: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: Choice[];
}
