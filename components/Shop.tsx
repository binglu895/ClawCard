import React from 'react';
import { GameState, Joker, Consumable } from '../types';
import { audio } from '../AudioEngine';
import { GET_JOKER_EFFECT_DISPLAY } from '../gameLogic';

interface ShopProps {
    state: GameState;
    shopItems: { jokers: Joker[], consumables: Consumable[] };
    onBuyJoker: (joker: Joker) => void;
    onBuyConsumable: (consumable: Consumable) => void;
    onSkip: () => void;
}

export const Shop: React.FC<ShopProps> = ({ state, shopItems, onBuyJoker, onBuyConsumable, onSkip }) => {
    return (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-background-dark/95 backdrop-blur-2xl animate-in fade-in zoom-in duration-500 p-12 overflow-hidden">
            <div className="w-full max-w-6xl">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Ante {state.ante} Shop</span>
                        <h1 className="text-6xl font-black text-white uppercase tracking-tighter">Shop (商店)</h1>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-end">
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Balance</span>
                            <span className="text-5xl font-black text-yellow-500 tabular-nums">${state.money}</span>
                        </div>
                        <button
                            onClick={onSkip}
                            className="px-12 py-5 bg-white text-black font-black text-xl rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"
                        >
                            NEXT ROUND (开始下一轮)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Jokers Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-primary"></span>
                            Jokers (小丑牌)
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            {shopItems.jokers.map(joker => {
                                const isOwned = state.jokersData.some(j => j.id === joker.id);
                                const currentLevel = state.jokersData.find(j => j.id === joker.id)?.level || 0;
                                const displayEffect = GET_JOKER_EFFECT_DISPLAY(joker);

                                return (
                                    <div
                                        key={joker.id}
                                        onClick={() => state.money >= joker.price && onBuyJoker(joker)}
                                        className={`
                                            group relative p-6 bg-zinc-900/50 border border-white/5 rounded-3xl transition-all h-[260px] flex flex-col justify-between cursor-pointer
                                            ${state.money >= joker.price ? 'hover:border-primary/50 hover:bg-zinc-800/80 hover:-translate-y-2' : 'opacity-40 grayscale cursor-not-allowed'}
                                            ${isOwned ? 'ring-2 ring-primary/30 ring-inset' : ''}
                                        `}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border
                                                    ${joker.rarity === 'Common' ? 'text-zinc-400 border-zinc-400' :
                                                        joker.rarity === 'Uncommon' ? 'text-green-400 border-green-400' :
                                                            joker.rarity === 'Rare' ? 'text-blue-400 border-blue-400' :
                                                                'text-yellow-500 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]'}
                                                `}>
                                                    {joker.rarity}
                                                </span>
                                                {isOwned && (
                                                    <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                                        Lv.{currentLevel} → {currentLevel + 1}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">
                                                {joker.name}
                                                {isOwned && <span className="ml-2 text-primary text-xs uppercase font-black tracking-widest">[UPGRADE]</span>}
                                            </h3>
                                            <p className="text-xs text-zinc-500 leading-relaxed">{joker.description}</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className={`font-bold text-sm tracking-tighter
                                                ${joker.rarity === 'Common' ? 'text-zinc-400' :
                                                    joker.rarity === 'Uncommon' ? 'text-green-400' :
                                                        joker.rarity === 'Rare' ? 'text-blue-400' :
                                                            'text-yellow-500'}
                                            `}>
                                                {displayEffect}
                                            </span>
                                            <span className="text-2xl font-black text-yellow-500 tabular-nums">${joker.price}</span>
                                        </div>

                                        {state.money >= joker.price && (
                                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                <span className="text-white font-black text-lg uppercase tracking-widest">{isOwned ? 'UPGRADE (升级)' : 'BUY (购买)'}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Consumables Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-mult-red"></span>
                            Consumables (消耗品)
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            {shopItems.consumables.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => state.money >= item.price && onBuyConsumable(item)}
                                    className={`
                    group relative p-6 bg-zinc-900/50 border border-white/5 rounded-3xl transition-all h-[240px] flex flex-col justify-between cursor-pointer
                    ${state.money >= item.price ? 'hover:border-mult-red/50 hover:bg-zinc-800/80 hover:-translate-y-2' : 'opacity-40 grayscale cursor-not-allowed'}
                  `}
                                >
                                    <div>
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border mb-3 inline-block
                      ${item.type === 'Planet' ? 'text-primary border-primary' : 'text-mult-red border-mult-red'}
                    `}>
                                            {item.type}
                                        </span>
                                        <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                                        <p className="text-xs text-zinc-500 leading-relaxed">{item.description}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-zinc-400 text-xs font-medium">{item.effect}</span>
                                        <span className="text-2xl font-black text-yellow-500 tabular-nums">${item.price}</span>
                                    </div>

                                    {state.money >= item.price && (
                                        <div className="absolute inset-0 bg-mult-red/20 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity flex items-center justify-center">
                                            <span className="text-white font-black text-lg uppercase tracking-widest">BUY (购买)</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
