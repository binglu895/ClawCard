import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Card } from './components/Card';
import { Shop } from './components/Shop';
import { Story } from './components/Story';
import { GameState, CardData, PokerHand, Enhancement, Edition, Seal, GamePhase, Joker, Consumable } from './types';
import { EVALUATE_HAND, GET_HAND_STATS, CALCULATE_CARD_CHIPS, CALCULATE_CARD_MULT, CALCULATE_CARD_X_MULT, GENERATE_DECK, SORT_CARDS_BY_RANK, CALCULATE_GOAL, GENERATE_SHOP_ITEMS } from './gameLogic';
import { audio } from './AudioEngine';

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

const GET_BLIND_NAME = (round: number) => {
  if (round === 1) return "Small Blind (小盲注)";
  if (round === 2) return "Big Blind (大盲注)";
  return "Boss Blind (首领盲注)";
};

const createInitialState = (): GameState => {
  const fullDeck = GENERATE_DECK();
  const initialHand = SORT_CARDS_BY_RANK(fullDeck.slice(0, HAND_SIZE));
  const remainingDeck = fullDeck.slice(HAND_SIZE);

  return {
    phase: GamePhase.Story,
    currentBlind: GET_BLIND_NAME(1),
    score: 0,
    goal: CALCULATE_GOAL(1, 1),
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
    jokers: [],
    jokersData: [],
    consumables: [],
    ante: 1,
    round: 1,
    storyProgress: 0
  };
};

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(createInitialState());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isRoundOver, setIsRoundOver] = useState<'victory' | 'defeat' | null>(null);
  const [shopItems, setShopItems] = useState(() => GENERATE_SHOP_ITEMS());

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

    // Joker Bonuses
    state.jokersData.forEach(j => {
      if (j.id === 'j_joker') mult += 4;
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

  // Check for Win/Loss
  useEffect(() => {
    if (state.phase !== GamePhase.Gameplay) return;
    if (state.score >= state.goal && !isRoundOver) {
      setIsRoundOver('victory');
      audio.playVictory();
    } else if (state.handsLeft === 0 && state.score < state.goal && !isRoundOver) {
      setIsRoundOver('defeat');
      audio.playDefeat();
    }
  }, [state.score, state.goal, state.handsLeft, isRoundOver, state.phase]);

  const handleToggleCard = useCallback((id: string) => {
    if (isRoundOver || state.phase !== GamePhase.Gameplay) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        audio.playCardDeselect();
        next.delete(id);
      } else if (next.size < 5) {
        audio.playCardSelect();
        next.add(id);
      }
      return next;
    });
  }, [isRoundOver, state.phase]);

  const handlePlayHand = () => {
    if (!currentHandPreview || state.handsLeft <= 0 || isRoundOver) return;

    const newCards = state.cards.filter(c => !selectedIds.has(c.id));
    const cardsNeeded = HAND_SIZE - newCards.length;
    const drawn = state.deck.slice(0, cardsNeeded);
    const remainingDeck = state.deck.slice(cardsNeeded);

    setState(prev => ({
      ...prev,
      score: prev.score + currentHandPreview.total,
      handsLeft: prev.handsLeft - 1,
      cards: SORT_CARDS_BY_RANK([...newCards, ...drawn]),
      deck: remainingDeck
    }));
    setSelectedIds(new Set());
  };

  const handleDiscard = () => {
    if (selectedIds.size === 0 || state.discardsLeft === 0 || isRoundOver) return;
    audio.playDiscard();

    const newCards = state.cards.filter(c => !selectedIds.has(c.id));
    const cardsNeeded = HAND_SIZE - newCards.length;
    const drawn = state.deck.slice(0, cardsNeeded);
    const remainingDeck = state.deck.slice(cardsNeeded);

    setState(prev => ({
      ...prev,
      discardsLeft: prev.discardsLeft - 1,
      cards: SORT_CARDS_BY_RANK([...newCards, ...drawn]),
      deck: remainingDeck
    }));
    setSelectedIds(new Set());
  };

  const handleNextRound = () => {
    if (isRoundOver === 'victory') {
      audio.playCardSelect();
      setState(prev => ({ ...prev, phase: GamePhase.Shop }));
      setShopItems(GENERATE_SHOP_ITEMS());
    } else {
      audio.playDefeat();
      setState(createInitialState());
    }
    setIsRoundOver(null);
    setSelectedIds(new Set());
  };

  const handleBuyJoker = (joker: Joker) => {
    if (state.money >= joker.price && state.jokersData.length < 5) {
      audio.playCardSelect();
      setState(prev => ({
        ...prev,
        money: prev.money - joker.price,
        jokers: [...prev.jokers, joker.id],
        jokersData: [...prev.jokersData, joker]
      }));
      setShopItems(prev => ({
        ...prev,
        jokers: prev.jokers.filter(j => j.id !== joker.id)
      }));
    }
  };

  const handleBuyConsumable = (item: Consumable) => {
    if (state.money >= item.price && state.consumables.length < 2) {
      audio.playCardSelect();
      setState(prev => ({
        ...prev,
        money: prev.money - item.price,
        consumables: [...prev.consumables, item]
      }));
      setShopItems(prev => ({
        ...prev,
        consumables: prev.consumables.filter(c => c.id !== item.id)
      }));
    }
  };

  const handleStartNextGameplay = () => {
    audio.playPlayHand();
    let nextRound = state.round + 1;
    let nextAnte = state.ante;
    if (nextRound > 3) {
      nextRound = 1;
      nextAnte += 1;
      setState(prev => ({ ...prev, phase: GamePhase.Story, storyProgress: prev.storyProgress + 1 }));
    } else {
      const fullDeck = GENERATE_DECK();
      const initialHand = SORT_CARDS_BY_RANK(fullDeck.slice(0, HAND_SIZE));

      setState(prev => ({
        ...prev,
        phase: GamePhase.Gameplay,
        round: nextRound,
        ante: nextAnte,
        goal: CALCULATE_GOAL(nextAnte, nextRound),
        score: 0,
        handsLeft: 4,
        discardsLeft: 3,
        currentBlind: GET_BLIND_NAME(nextRound),
        cards: initialHand,
        deck: fullDeck.slice(HAND_SIZE),
        money: prev.money + 5
      }));
    }
  };

  const handleCompleteStory = () => {
    setState(prev => ({ ...prev, phase: GamePhase.Gameplay }));
    audio.playPlayHand();
  };

  return (
    <div className="flex h-screen w-screen bg-background-dark font-display overflow-hidden relative">
      <div className="noise-overlay" />

      <Sidebar state={state} />

      <main className="flex-1 flex flex-col relative">
        {state.phase === GamePhase.Shop && (
          <Shop
            state={state}
            shopItems={shopItems}
            onBuyJoker={handleBuyJoker}
            onBuyConsumable={handleBuyConsumable}
            onSkip={handleStartNextGameplay}
          />
        )}

        {state.phase === GamePhase.Story && (
          <Story state={state} onComplete={handleCompleteStory} />
        )}

        {/* Top Header */}
        <div className="p-12 pb-0 flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest italic">Ante (底注阶级)</span>
            <span className="text-xl font-medium tracking-tight text-white">{state.ante} / 8</span>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest italic">Current Hand (当前牌型)</span>
            <span className="text-xl font-medium tracking-tight text-white">{currentHandPreview?.hand || "Select Cards"}</span>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest italic">Level (等级)</span>
            <span className="text-xl font-medium tracking-tight text-white">Lv. {currentHandPreview?.level || 1}</span>
          </div>

          <div className="ml-auto flex gap-4">
            {state.jokersData.map((j, i) => (
              <div key={i} className="px-4 py-2 bg-zinc-900 border border-primary/30 rounded-lg flex flex-col items-center">
                <span className="text-[8px] font-black text-primary uppercase">{j.rarity}</span>
                <span className="text-xs font-bold text-white">{j.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center Game Field */}
        <div className="flex-1 flex flex-col items-center justify-center p-12 relative">

          {isRoundOver && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background-dark/80 backdrop-blur-xl animate-in fade-in duration-500">
              <div className="flex flex-col items-center p-12 bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl scale-125">
                <h2 className={`text-6xl font-black uppercase tracking-tighter mb-4 ${isRoundOver === 'victory' ? 'text-primary' : 'text-mult-red'}`}>
                  {isRoundOver === 'victory' ? 'Victory! (胜利)' : 'Defeat! (失败)'}
                </h2>
                <div className="flex gap-12 mb-8">
                  <div className="text-center">
                    <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Final Score</p>
                    <p className="text-4xl font-black text-white">{state.score.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Goal</p>
                    <p className="text-4xl font-black text-zinc-400">{state.goal.toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={handleNextRound}
                  className="px-10 py-4 bg-white text-black font-black text-lg rounded-xl hover:bg-zinc-200 transition-all active:scale-95"
                >
                  {isRoundOver === 'victory' ? 'Go to Shop (前往商店)' : 'Retry (重新开始)'}
                </button>
              </div>
            </div>
          )}

          {currentHandPreview && (
            <div className="mb-8 flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="px-6 py-4 bg-primary/10 border border-primary/30 rounded-xl flex flex-col items-center shadow-2xl backdrop-blur-md">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Chips (筹码)</span>
                <span className="text-2xl font-bold text-white tabular-nums">{currentHandPreview.chips}</span>
              </div>
              <div className="px-6 py-4 bg-mult-red/10 border border-mult-red/30 rounded-xl flex flex-col items-center shadow-2xl backdrop-blur-md">
                <span className="text-[10px] font-bold text-mult-red uppercase tracking-widest mb-1">Mult (倍率)</span>
                <span className="text-2xl font-bold text-white tabular-nums">{currentHandPreview.mult} × {currentHandPreview.xMult.toFixed(1)}</span>
              </div>
              <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center shadow-2xl backdrop-blur-md min-w-[160px]">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Predict (预计得分)</span>
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
              disabled={selectedIds.size === 0 || state.handsLeft === 0 || isRoundOver !== null || state.phase !== GamePhase.Gameplay}
              className={`
                bg-primary hover:bg-primary/90 text-white font-bold text-sm px-10 py-3.5 rounded-lg 
                flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale
              `}
            >
              PLAY HAND (出牌)
              <span className="material-symbols-outlined text-sm">play_arrow</span>
            </button>
            <button
              onClick={handleDiscard}
              disabled={selectedIds.size === 0 || state.discardsLeft === 0 || isRoundOver !== null || state.phase !== GamePhase.Gameplay}
              className={`
                border border-mult-red/40 hover:bg-mult-red/10 text-mult-red font-bold text-sm px-10 py-3.5 
                rounded-lg transition-all active:scale-95 disabled:opacity-30
              `}
            >
              DISCARD (弃牌)
            </button>
          </div>

          <div className="ml-auto flex items-center gap-6 bg-zinc-900/40 px-5 py-2.5 rounded-xl border border-zinc-800/50">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Deck (剩余牌组)</span>
              <span className="text-lg font-bold text-zinc-400">{state.deck.length}</span>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Money (持有金钱)</span>
              <span className="text-lg font-bold text-yellow-500">${state.money}</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
