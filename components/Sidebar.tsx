
import React from 'react';
import { GameState } from '../types';

interface SidebarProps {
  state: GameState;
}

export const Sidebar: React.FC<SidebarProps> = ({ state }) => {
  const progressPercent = Math.min((state.score / state.goal) * 100, 100);

  return (
    <aside className="w-80 frosted-panel h-full flex flex-col p-8 z-10 shrink-0">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-sm">target</span>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Current Blind</p>
        </div>
        <h2 className="text-2xl font-bold tracking-tight uppercase">{state.currentBlind}</h2>
        
        <div className="mt-4 w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-1000" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-2 text-[10px] text-zinc-400 uppercase tracking-tight font-medium">
          <span>Score: {state.score.toLocaleString()}</span>
          <span>Goal: {state.goal.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-2">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-1">Chips</p>
          <h3 className="text-5xl font-bold text-primary neon-blue-glow tabular-nums transition-all">
            {state.chips.toLocaleString()}
          </h3>
        </div>

        <div className="my-6">
          <span className="material-symbols-outlined text-4xl text-zinc-700 font-light select-none">close</span>
        </div>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-1">Mult</p>
          <h3 className="text-5xl font-bold text-mult-red neon-red-glow tabular-nums transition-all">
            {state.mult}
          </h3>
        </div>
      </div>

      <div className="mt-auto space-y-4">
        <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">Hands Left</span>
          <span className="text-xl font-bold tabular-nums">{state.handsLeft.toString().padStart(2, '0')}</span>
        </div>
        <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">Discards</span>
          <span className="text-xl font-bold tabular-nums">{state.discardsLeft.toString().padStart(2, '0')}</span>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">Money</span>
          <span className="text-xl font-bold text-yellow-500 tabular-nums">${state.money}</span>
        </div>
      </div>
    </aside>
  );
};
