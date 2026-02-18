import React from 'react';
import { GameState } from '../types';

interface SidebarProps {
  state: GameState;
}

export const Sidebar: React.FC<SidebarProps> = ({ state }) => {
  const progressPercent = state.goal > 0 ? Math.min((state.tao / state.goal) * 100, 100) : 0;

  return (
    <aside className="w-80 frosted-panel h-full flex flex-col p-8 z-10 shrink-0 border-r border-white/5 bg-[#0a0a0a]/80">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-sm">temple_buddhist</span>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Foundation (修行进度)</p>
        </div>
        <h2 className="text-2xl font-bold tracking-tight uppercase text-white mb-6">{state.currentBlind}</h2>

        <div className="space-y-1">
          <div className="flex justify-between items-end">
            <span className="text-[10px] text-zinc-500 uppercase font-extrabold tracking-tighter">Tao (道行)</span>
            <span className="text-3xl font-black text-white tabular-nums drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              {state.tao.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-zinc-800/50 h-3 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <div
              className={`h-full transition-all duration-1000 ${state.tao >= state.goal ? 'bg-primary' : 'bg-primary/50'} shadow-[0_0_15px_rgba(37,140,244,0.4)]`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-start mt-1">
            <span className="text-[10px] text-zinc-500 uppercase font-extrabold tracking-tighter">Tribulation (劫难)</span>
            <span className="text-lg font-bold text-zinc-400 tabular-nums">
              {state.goal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-2">
        <div className="text-center group">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-1 italic">Base Tao (基础道行)</p>
          <h3 className="text-6xl font-black text-primary neon-blue-glow tabular-nums transition-all group-hover:scale-110 duration-300">
            {state.chips.toLocaleString()}
          </h3>
        </div>

        <div className="my-4">
          <span className="material-symbols-outlined text-4xl text-zinc-800 font-light select-none">close</span>
        </div>

        <div className="text-center group">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-1 italic">Base Mult (基础倍率)</p>
          <h3 className="text-6xl font-black text-mult-red neon-red-glow tabular-nums transition-all group-hover:scale-110 duration-300">
            {state.mult}
          </h3>
        </div>
      </div>

      <div className="mt-auto space-y-4 pt-8 border-t border-zinc-800/50">
        <div className="flex justify-between items-center text-zinc-400">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-600">Year Plays</span>
            <span className="text-[10px] text-zinc-500">剩余岁限</span>
          </div>
          <span className="text-3xl font-black tabular-nums text-white">{state.handsLeft}</span>
        </div>

        <div className="flex justify-between items-center text-zinc-400">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-600">Discards Left</span>
            <span className="text-[10px] text-zinc-500">剩余驱散</span>
          </div>
          <span className="text-3xl font-black tabular-nums text-mult-red/80">{state.discardsLeft}</span>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-yellow-500/10 rounded-lg">
              <span className="material-symbols-outlined text-yellow-500 text-sm">diamond</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-black text-yellow-500/80 tracking-widest">Spirit Stones</span>
              <span className="text-[10px] text-zinc-600">持有灵石</span>
            </div>
          </div>
          <span className="text-3xl font-black text-yellow-500 tabular-nums">{state.spiritStones}</span>
        </div>
      </div>
    </aside>
  );
};
