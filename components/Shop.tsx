import React from 'react';
import { GameState, Joker, Consumable } from '../types';
import { audio } from '../AudioEngine';
import { GET_JOKER_EFFECT_DISPLAY, GET_ITEM_TIER, GET_ITEM_ICON, GET_LEVEL_COLOR } from '../gameLogic';
import { ItemTooltip } from './ItemTooltip';

interface ShopProps {
    state: GameState;
    shopItems: { jokers: Joker[], consumables: Consumable[] };
    onBuyJoker: (joker: Joker) => void;
    onBuyConsumable: (consumable: Consumable) => void;
    onSkip: () => void;
    rerollCost: number;
    onReroll: () => void;
}

export const Shop: React.FC<ShopProps> = ({ state, shopItems, onBuyJoker, onBuyConsumable, onSkip, rerollCost, onReroll }) => {
    // Combine all items for a unified grid
    const allItems = [
        ...shopItems.jokers.map(j => ({ ...j, isArtifact: true })),
        ...shopItems.consumables.map(c => ({ ...c, isArtifact: false }))
    ];

    return (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-background-dark/95 backdrop-blur-3xl animate-in fade-in zoom-in duration-500 p-8 overflow-hidden">
            <div className="w-full max-w-7xl h-full flex flex-col">
                {/* Header Area */}
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div>
                        <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-1 block">Hermitage Market</span>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                            Market (坊市)
                            <span className="text-xl text-zinc-600 font-medium">Year {state.year}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Reroll Button */}
                        <button
                            onClick={onReroll}
                            disabled={state.spiritStones < rerollCost}
                            className={`
                                flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all active:scale-95
                                ${state.spiritStones >= rerollCost
                                    ? 'border-primary/50 bg-primary/5 text-primary hover:bg-primary hover:text-white shadow-[0_0_20px_rgba(37,140,244,0.1)]'
                                    : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed opacity-50'}
                            `}
                        >
                            <span className="material-symbols-outlined text-sm">refresh</span>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-xs font-black uppercase tracking-wider">Refresh</span>
                                <span className="text-[10px] font-bold opacity-80">${rerollCost}</span>
                            </div>
                        </button>

                        <div className="h-10 w-px bg-zinc-800" />

                        <div className="flex flex-col items-end mr-4">
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Balance</span>
                            <span className="text-4xl font-black text-yellow-500 tabular-nums">${state.spiritStones}</span>
                        </div>

                        <button
                            onClick={onSkip}
                            className="px-10 py-4 bg-white text-black font-black text-lg rounded-xl hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"
                        >
                            NEXT (出发)
                        </button>
                    </div>
                </div>

                {/* 4x2 Grid Area */}
                <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
                    {allItems.map((item: any, idx) => {
                        if (item.isArtifact) {
                            const artifact = item as Joker;
                            const equipped = state.equipment[artifact.slot];
                            // Use endsWith to check if this artifact is an upgrade
                            const isMerge = equipped && artifact.id.endsWith(equipped.id) && equipped.level === artifact.level;
                            const displayEffect = GET_JOKER_EFFECT_DISPLAY(artifact);

                            const { iconName, bgGradient } = GET_ITEM_ICON(artifact.slot, GET_ITEM_TIER(artifact.id));
                            const borderClass = GET_LEVEL_COLOR(artifact.level || 1);

                            return (
                                <ItemTooltip key={artifact.id} item={artifact}>
                                    <div
                                        onClick={() => state.spiritStones >= artifact.price && onBuyJoker(artifact)}
                                        className={`
                                            group relative p-5 bg-zinc-900/40 border-2 ${borderClass} rounded-2xl transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden h-full
                                            ${state.spiritStones >= artifact.price ? 'hover:scale-105' : 'opacity-30 grayscale cursor-not-allowed'}
                                        `}
                                    >
                                        <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${bgGradient} flex items-center justify-center mb-4`}>
                                            <span className="material-symbols-outlined text-5xl text-white/70">
                                                {iconName}
                                            </span>
                                        </div>

                                        <div className="text-center">
                                            <h3 className="text-sm font-bold text-white mb-1 leading-tight tracking-wide uppercase">
                                                {artifact.name}
                                            </h3>
                                            <div className="flex items-center justify-center gap-1.5">
                                                <span className="text-[10px] font-bold text-yellow-500">$</span>
                                                <span className="text-lg font-black text-yellow-500 tabular-nums">{artifact.price}</span>
                                            </div>
                                        </div>

                                        {state.spiritStones >= artifact.price && (
                                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-[1px]">
                                                <span className="text-white font-black text-[10px] uppercase tracking-widest">
                                                    {isMerge ? 'MERGE (融合)' : equipped ? 'REPLACE (更替)' : 'EQUIP (炼化)'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </ItemTooltip>
                            );
                        } else {
                            const consumable = item as Consumable;
                            const isFull = state.consumables.length >= 2;
                            const canBuy = state.spiritStones >= consumable.price && !isFull;

                            return (
                                <div
                                    key={consumable.id}
                                    onClick={() => canBuy && onBuyConsumable(consumable)}
                                    className={`
                                        group relative p-5 bg-zinc-900/40 border border-white/5 rounded-2xl transition-all flex flex-col justify-between cursor-pointer overflow-hidden
                                        ${canBuy ? 'hover:border-mult-red/40 hover:bg-zinc-800/60' : 'opacity-30 grayscale cursor-not-allowed'}
                                    `}
                                >
                                    <div>
                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border mb-2 inline-block
                                          ${consumable.type === 'Planet' ? 'text-primary border-primary/50 bg-primary/5' : 'text-mult-red border-mult-red/50 bg-mult-red/5'}
                                        `}>
                                            {consumable.type === 'Planet' ? 'Elixir' : 'Scroll'}
                                        </span>
                                        <h3 className="text-lg font-bold text-white mb-1 leading-tight">{consumable.name}</h3>
                                        <p className="text-[10px] text-zinc-500 leading-normal line-clamp-3">{consumable.description}</p>
                                    </div>
                                    <div className="flex justify-between items-end mt-2">
                                        <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-tighter">{consumable.effect}</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-bold text-yellow-500 opacity-50">$</span>
                                            <span className="text-xl font-black text-yellow-500 tabular-nums">{consumable.price}</span>
                                        </div>
                                    </div>

                                    {canBuy && (
                                        <div className="absolute inset-0 bg-mult-red/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                            <span className="text-white font-black text-sm uppercase tracking-widest">OBTAIN (获取)</span>
                                        </div>
                                    )}
                                    {isFull && state.spiritStones >= consumable.price && (
                                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/80 rounded text-[8px] font-black text-white uppercase">Storage Full</div>
                                    )}
                                </div>
                            );
                        }
                    })}
                </div>
            </div>
        </div>
    );
};
