import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Card } from './components/Card';
import { GameState, CardData, PokerHand, Enhancement, Edition, Seal } from './types';
import { EVALUATE_HAND, GET_HAND_STATS, CALCULATE_CARD_CHIPS, CALCULATE_CARD_MULT, CALCULATE_CARD_X_MULT, GENERATE_DECK } from './gameLogic';

const INITIAL_HAND_LEVELS: Record<PokerHand, number> = {
  'High Card': 1,
  'Pair': 1,
  'Two Pair': 1,
  'Three of a Kind': 1,
  'Straight': 1,
  'Flush': 1,
  'Full House': 1,
  'Four of a Kind': 1,
  'Five of a Kind': 1,
  'Straight Flush': 1,
  'Royal Flush': 1,
};

const HAND_SIZE = 8;

const createInitialState = (): GameState => {
  const fullDeck = GENERATE_DECK();
  const initialHand = fullDeck.slice(0, HAND_SIZE);
  const remainingDeck = fullDeck.slice(HAND_SIZE);

  return {
    currentBlind: "Small Blind",
    score: 0,
    goal: 300,
    chips: 0,
    mult: 0,
    handsLeft: 4,
    discardsLeft: 3,
    money: 4,
    pokerHand: "High Card",
    level: 1,
    handLevels: INITIAL_HAND_LEVELS,
    cards: initialHand,
    deck: remainingDeck,
    jokers: []
  };
};

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(createInitialState());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedCards = useMemo(() =>
    state.cards.filter(c => selectedIds.has(c.id)),
    [state.cards, selectedIds]);

  const currentHandPreview = useMemo(() => {
    if (selectedCards.length === 0) return null;
    const hand = EVALUATE_HAND(selectedCards);
    const level = state.handLevels[hand];
    const [baseChips, baseMult] = GET_HAND_STATS(hand, level);

    let chips = baseChips;
    let mult = baseMult;
    let xMult = 1;

    selectedCards.forEach(c => {
      chips += CALCULATE_CARD_CHIPS(c);
      mult += CALCULATE_CARD_MULT(c);
      xMult *= CALCULATE_CARD_X_MULT(c);
    });

    return {
      hand,
      level,
      chips,
      mult,
      xMult,
      total: Math.floor(chips * mult * xMult)
    };
  }, [selectedCards, state.handLevels]);

  // Sync preview to state for Sidebar
  useEffect(() => {
    if (currentHandPreview) {
      setState(prev => ({
        ...prev,
        chips: currentHandPreview.chips,
        mult: currentHandPreview.mult,
        pokerHand: currentHandPreview.hand
      }));
    } else {
      setState(prev => ({
        ...prev,
        chips: 0,
        mult: 0,
        pokerHand: 'High Card'
      }));
    }
  }, [currentHandPreview]);

  const handleToggleCard = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 5) next.add(id);
      return next;
    });
  }, []);

  const handlePlayHand = () => {
    if (!currentHandPreview || state.handsLeft <= 0) return;

    const newCards = state.cards.filter(c => !selectedIds.has(c.id));
    const cardsNeeded = HAND_SIZE - newCards.length;
    const drawn = state.deck.slice(0, cardsNeeded);
    const remainingDeck = state.deck.slice(cardsNeeded);

    setState(prev => ({
      ...prev,
      score: prev.score + currentHandPreview.total,
      handsLeft: prev.handsLeft - 1,
      cards: [...newCards, ...drawn],
      deck: remainingDeck
    }));
    setSelectedIds(new Set());
  };

  const handleDiscard = () => {
    if (selectedIds.size === 0 || state.discardsLeft === 0) return;

    const newCards = state.cards.filter(c => !selectedIds.has(c.id));
    const cardsNeeded = HAND_SIZE - newCards.length;
    const drawn = state.deck.slice(0, cardsNeeded);
    const remainingDeck = state.deck.slice(cardsNeeded);

    setState(prev => ({
      ...prev,
      discardsLeft: prev.discardsLeft - 1,
      cards: [...newCards, ...drawn],
      deck: remainingDeck
    }));
    setSelectedIds(new Set());
  };

  return (
    <div className="flex h-screen w-screen bg-background-dark font-display overflow-hidden relative">
      <div className="noise-overlay" />

      <Sidebar state={state} />

      <main className="flex-1 flex flex-col relative">
        {/* Top Header */}
        <div className="p-12 pb-0 flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Poker Hand</span>
            <span className="text-xl font-medium tracking-tight text-white">{currentHandPreview?.hand || "Select Cards"}</span>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Hand Level</span>
            <span className="text-xl font-medium tracking-tight text-white">Lv. {currentHandPreview?.level || 1}</span>
          </div>
        </div>

        {/* Center Game Field */}
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          {currentHandPreview && (
            <div className="mb-8 flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="px-6 py-4 bg-primary/10 border border-primary/30 rounded-xl flex flex-col items-center shadow-2xl backdrop-blur-md">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Chips</span>
                <span className="text-2xl font-bold text-white tabular-nums">{currentHandPreview.chips}</span>
              </div>
              <div className="px-6 py-4 bg-mult-red/10 border border-mult-red/30 rounded-xl flex flex-col items-center shadow-2xl backdrop-blur-md">
                <span className="text-[10px] font-bold text-mult-red uppercase tracking-widest mb-1">Mult</span>
                <span className="text-2xl font-bold text-white tabular-nums">{currentHandPreview.mult} × {currentHandPreview.xMult.toFixed(1)}</span>
              </div>
              <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center shadow-2xl backdrop-blur-md min-w-[160px]">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Score</span>
                <span className="text-3xl font-black text-white tabular-nums">{currentHandPreview.total.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex gap-4 items-end h-[300px]">
            {state.cards.map(card => (
              <Card
                key={card.id}
                card={card}
                isSelected={selectedIds.has(card.id)}
                onToggleSelect={handleToggleCard}
              />
            ))}
          </div>
        </div>

        {/* Bottom Bar Controls */}
        <footer className="h-24 border-t border-zinc-800/50 bg-[#0d0d0d] flex items-center px-12 z-20 shrink-0">
          <div className="flex gap-4">
            <button
              onClick={handlePlayHand}
              disabled={selectedIds.size === 0 || state.handsLeft === 0}
              className={`
                bg-primary hover:bg-primary/90 text-white font-bold text-sm px-10 py-3.5 rounded-lg 
                flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale
              `}
            >
              PLAY HAND
              <span className="material-symbols-outlined text-sm">play_arrow</span>
            </button>
            <button
              onClick={handleDiscard}
              disabled={selectedIds.size === 0 || state.discardsLeft === 0}
              className={`
                border border-mult-red/40 hover:bg-mult-red/10 text-mult-red font-bold text-sm px-10 py-3.5 
                rounded-lg transition-all active:scale-95 disabled:opacity-30
              `}
            >
              DISCARD
            </button>
          </div>

          <div className="ml-auto flex items-center gap-6 bg-zinc-900/40 px-5 py-2.5 rounded-xl border border-zinc-800/50">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Deck</span>
              <span className="text-lg font-bold text-zinc-400">{state.deck.length}</span>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Money</span>
              <span className="text-lg font-bold text-yellow-500">${state.money}</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
