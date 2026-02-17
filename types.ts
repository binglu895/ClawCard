
export type Suit = 'HEARTS' | 'SPADES' | 'DIAMONDS' | 'CLUBS';

export interface CardData {
  id: string;
  rank: string;
  suit: Suit;
  isFoil?: boolean;
}

export interface GameState {
  currentBlind: string;
  score: number;
  goal: number;
  chips: number;
  mult: number;
  handsLeft: number;
  discardsLeft: number;
  money: number;
  pokerHand: string;
  level: number;
  cards: CardData[];
}
