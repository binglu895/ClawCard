import React from 'react';
import { GameState } from '../types';

interface SidebarProps {
  state: GameState;
}

export const Sidebar: React.FC<SidebarProps> = ({ state }) => {
  const progressPercent = state.goal > 0 ? Math.min((state.score / state.goal) * 100, 100) : 0;

  return (
    <aside className="w-80 frosted-panel h-full flex flex-col p-8 z-10 shrink-0 border-r border-white/5">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-sm">target</span>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Current Blind</p>
        </div>
        <h2 className="text-2xl font-bold tracking-tight uppercase text-white">{state.currentBlind}</h2>

        <div className="mt-4 w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden border border-white/5">
          <div
            className="bg-primary h-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,140,244,0.5)]"
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
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-1">Base Chips</p>
          <h3 className="text-5xl font-bold text-primary neon-blue-glow tabular-nums transition-all">
            {state.chips.toLocaleString()}
          </h3>
        </div>

        <div className="my-6">
          <span className="material-symbols-outlined text-4xl text-zinc-700 font-light select-none">close</span>
        </div>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-1">Base Mult</p>
          <h3 className="text-5xl font-bold text-mult-red neon-red-glow tabular-nums transition-all">
            {state.mult}
          </h3>
        </div>
      </div>

      <div className="mt-auto space-y-4">
        <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">Hands Left</span>
          <span className="text-xl font-bold tabular-nums text-white">{state.handsLeft.toString().padStart(2, '0')}</span>
        </div>
        <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">Discards</span>
          <span className="text-xl font-bold tabular-nums text-white">{state.discardsLeft.toString().padStart(2, '0')}</span>
        </div>
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-yellow-500 text-xs">payments</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Money</span>
          </div>
          <span className="text-xl font-bold text-yellow-500 tabular-nums">${state.money}</span>
        </div>
      </div>
    </aside>
  );
};
