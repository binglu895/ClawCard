
import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Card } from './components/Card';
import { GameState, CardData } from './types';

const INITIAL_STATE: GameState = {
  currentBlind: "Big Blind",
  score: 1085280,
  goal: 2000000,
  chips: 25840,
  mult: 42,
  handsLeft: 4,
  discardsLeft: 3,
  money: 12,
  pokerHand: "Three of a Kind",
  level: 3,
  cards: [
    { id: '1', rank: 'A', suit: 'HEARTS', isFoil: true },
    { id: '2', rank: 'K', suit: 'HEARTS' },
    { id: '3', rank: '10', suit: 'SPADES' },
    { id: '4', rank: '7', suit: 'DIAMONDS' },
    { id: '5', rank: '2', suit: 'CLUBS' },
  ],
};

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['1', '3']));

  const handleToggleCard = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 5) next.add(id);
      return next;
    });
  }, []);

  const handlePlayHand = () => {
    if (selectedIds.size === 0) return;
    // Mock simulation
    setState(prev => ({
      ...prev,
      score: Math.min(prev.score + (prev.chips * prev.mult), prev.goal * 1.5),
      handsLeft: Math.max(0, prev.handsLeft - 1)
    }));
    setSelectedIds(new Set());
  };

  const handleDiscard = () => {
    if (selectedIds.size === 0 || state.discardsLeft === 0) return;
    setState(prev => ({
      ...prev,
      discardsLeft: prev.discardsLeft - 1
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
            <span className="text-xl font-medium tracking-tight">{state.pokerHand}</span>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Level</span>
            <span className="text-xl font-medium tracking-tight">Lv. {state.level}</span>
          </div>
        </div>

        {/* Center Game Field */}
        <div className="flex-1 flex flex-col items-center justify-center p-12">
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

          {/* Active Bonuses */}
          <div className="mt-16 flex gap-4">
            <div className="px-5 py-3 bg-zinc-900/40 border border-zinc-800/50 rounded-lg flex items-center gap-3 shadow-xl backdrop-blur-sm">
              <div className="w-8 h-10 bg-primary rounded-sm shadow-[0_0_10px_rgba(37,140,244,0.3)]" />
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Joker Bonus</p>
                <p className="text-xs font-medium">+10 Mult</p>
              </div>
            </div>
            <div className="px-5 py-3 bg-zinc-900/40 border border-zinc-800/50 rounded-lg flex items-center gap-3 shadow-xl backdrop-blur-sm">
              <div className="w-8 h-10 bg-mult-red rounded-sm shadow-[0_0_10px_rgba(255,77,77,0.3)]" />
              <div>
                <p className="text-[10px] font-bold text-mult-red uppercase tracking-wider">Spectral</p>
                <p className="text-xs font-medium">x1.5 Mult</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar Controls */}
        <footer className="h-24 border-t border-zinc-800/50 bg-[#0d0d0d] flex items-center px-12 z-20 shrink-0">
          <div className="flex gap-4">
            <button 
              onClick={handlePlayHand}
              disabled={selectedIds.size === 0}
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
            <button className="border border-zinc-700/50 hover:bg-zinc-800 text-zinc-500 font-bold text-sm px-8 py-3.5 rounded-lg transition-all active:scale-95">
              RUN STATS
            </button>
          </div>

          <div className="ml-auto flex items-center gap-6 bg-zinc-900/40 px-5 py-2.5 rounded-xl border border-zinc-800/50">
            {[
              { color: '#121212', label: '#121212' },
              { color: '#258cf4', label: '#258cf4' },
              { color: '#ff4d4d', label: '#ff4d4d' },
              { color: '#f5f5f5', label: '#f5f5f5' },
            ].map(p => (
              <div key={p.label} className="flex flex-col items-center gap-1.5">
                <div 
                  className="w-4 h-4 rounded-full border border-white/10" 
                  style={{ backgroundColor: p.color }} 
                />
                <span className="text-[8px] text-zinc-600 uppercase font-bold tracking-tighter">{p.label}</span>
              </div>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
