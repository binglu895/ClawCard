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
                        <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Ante {state.ante} Hermitage</span>
                        <h1 className="text-6xl font-black text-white uppercase tracking-tighter">Market (坊市)</h1>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-end">
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Spirit Stones</span>
                            <span className="text-5xl font-black text-yellow-500 tabular-nums">{state.spiritStones}</span>
                        </div>
                        <button
                            onClick={onSkip}
                            className="px-12 py-5 bg-white text-black font-black text-xl rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"
                        >
                            ENLIGHTEN (提升修为)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Artifacts Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-primary"></span>
                            Artifacts (法宝)
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            {shopItems.jokers.map(artifact => {
                                const equipped = state.equipment[artifact.slot];
                                const isMerge = equipped && equipped.id === artifact.id && equipped.level === artifact.level;
                                const displayEffect = GET_JOKER_EFFECT_DISPLAY(artifact);

                                return (
                                    <div
                                        key={artifact.id}
                                        onClick={() => state.spiritStones >= artifact.price && onBuyJoker(artifact)}
                                        className={`
                                            group relative p-6 bg-zinc-900/50 border border-white/5 rounded-3xl transition-all h-[260px] flex flex-col justify-between cursor-pointer
                                            ${state.spiritStones >= artifact.price ? 'hover:border-primary/50 hover:bg-zinc-800/80 hover:-translate-y-2' : 'opacity-40 grayscale cursor-not-allowed'}
                                        `}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border
                                                    ${artifact.rarity === 'Common' ? 'text-zinc-400 border-zinc-400' :
                                                        artifact.rarity === 'Uncommon' ? 'text-green-400 border-green-400' :
                                                            artifact.rarity === 'Rare' ? 'text-blue-400 border-blue-400' :
                                                                'text-yellow-500 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]'}
                                                `}>
                                                    {artifact.rarity}
                                                </span>
                                                <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                                    {artifact.slot}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">
                                                {artifact.name}
                                                {isMerge && <span className="ml-2 text-primary text-xs uppercase font-black tracking-widest">[MERGE]</span>}
                                            </h3>
                                            <p className="text-xs text-zinc-500 leading-relaxed">{artifact.description}</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className={`font-bold text-sm tracking-tighter
                                                ${artifact.rarity === 'Common' ? 'text-zinc-400' :
                                                    artifact.rarity === 'Uncommon' ? 'text-green-400' :
                                                        artifact.rarity === 'Rare' ? 'text-blue-400' :
                                                            'text-yellow-500'}
                                            `}>
                                                {displayEffect}
                                            </span>
                                            <span className="text-2xl font-black text-yellow-500 tabular-nums">{artifact.price}</span>
                                        </div>

                                        {state.spiritStones >= artifact.price && (
                                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                <span className="text-white font-black text-lg uppercase tracking-widest">
                                                    {isMerge ? 'MERGE (融合)' : equipped ? 'REPLACE (更替)' : 'EQUIP (炼化)'}
                                                </span>
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
                            Mental Methods (锦囊/丹药)
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            {shopItems.consumables.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => state.spiritStones >= item.price && onBuyConsumable(item)}
                                    className={`
                                        group relative p-6 bg-zinc-900/50 border border-white/5 rounded-3xl transition-all h-[240px] flex flex-col justify-between cursor-pointer
                                        ${state.spiritStones >= item.price ? 'hover:border-mult-red/50 hover:bg-zinc-800/80 hover:-translate-y-2' : 'opacity-40 grayscale cursor-not-allowed'}
                                    `}
                                >
                                    <div>
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border mb-3 inline-block
                                          ${item.type === 'Planet' ? 'text-primary border-primary' : 'text-mult-red border-mult-red'}
                                        `}>
                                            {item.type === 'Planet' ? 'Elixir' : 'Scroll'}
                                        </span>
                                        <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                                        <p className="text-xs text-zinc-500 leading-relaxed">{item.description}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-zinc-400 text-xs font-medium">{item.effect}</span>
                                        <span className="text-2xl font-black text-yellow-500 tabular-nums">{item.price}</span>
                                    </div>

                                    {state.spiritStones >= item.price && (
                                        <div className="absolute inset-0 bg-mult-red/20 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity flex items-center justify-center">
                                            <span className="text-white font-black text-lg uppercase tracking-widest">OBTAIN (获取)</span>
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
