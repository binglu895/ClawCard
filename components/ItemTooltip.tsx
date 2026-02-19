import React from 'react';
import { Joker, Consumable } from '../types';
import { GET_JOKER_EFFECT_DISPLAY, GET_ITEM_TIER, GET_LEVEL_COLOR } from '../gameLogic';

interface TooltipProps {
    item: Joker | Consumable;
    children: React.ReactNode;
}

export const ItemTooltip: React.FC<TooltipProps> = ({ item, children }) => {
    const isArtifact = 'slot' in item;

    // Determine Tier and Colors for Artifacts
    let tier = 0;
    let borderColor = 'border-[#444]';
    if (isArtifact) {
        tier = GET_ITEM_TIER(item.id);
        const lvlClass = GET_LEVEL_COLOR((item as Joker).level || 1);
        // Extract just the border color from the long string for the tooltip header
        borderColor = lvlClass.split(' ')[0];
    }

    const tierNames = ["", "翠竹套装 (Tier 1)", "玄铁套装 (Tier 2)", "吐纳套装 (Tier 3)", "乾坤套装 (Tier 4)", "无我套装 (Tier 5)"];

    return (
        <div className="relative group">
            {/* Target Element */}
            {children}

            {/* Floating Tooltip Container */}
            <div className="absolute z-[9999] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-72 bg-[#0c0c0e]/95 border border-[#2a2a30] rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-md pointer-events-none transform group-hover:-translate-y-1">

                {/* Glow effect matching rarity */}
                <div className={`absolute top-0 left-0 w-full h-1 ${borderColor} border-t-2 rounded-t-lg opacity-80 shadow-[0_0_10px_currentColor]`} />

                <div className="p-4">
                    {/* Header */}
                    <div className="border-b border-white/10 pb-3 mb-3">
                        <h4 className="text-xl font-black text-white tracking-wide mb-2">{item.name}</h4>
                        <div className="flex justify-between items-center">
                            {isArtifact ? (
                                <>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-sm bg-black/50 border border-white/10 text-zinc-300`}>
                                        部位: {(item as Joker).slot}
                                    </span>
                                    <span className="text-[10px] font-bold text-yellow-600/80">
                                        {tierNames[tier]}
                                    </span>
                                </>
                            ) : (
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-sm border 
                  ${(item as Consumable).type === 'Planet' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-mult-red/10 border-mult-red/30 text-mult-red'}
                `}>
                                    {(item as Consumable).type === 'Planet' ? '灵丹 (Elixir)' : '秘卷 (Scroll)'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="space-y-2 my-3">
                        <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase mb-1">[ 属性参数 ]</p>

                        {isArtifact ? (
                            <>
                                <div className="flex items-center justify-between bg-white/5 px-2.5 py-2 rounded">
                                    <span className="text-xs text-zinc-400 font-medium">核心词条</span>
                                    <span className="text-xs text-green-400 font-black">{GET_JOKER_EFFECT_DISPLAY(item as Joker)}</span>
                                </div>
                                <div className="flex items-center justify-between bg-white/5 px-2.5 py-2 rounded">
                                    <span className="text-xs text-zinc-400 font-medium">当前境界</span>
                                    <span className="text-xs text-blue-400 font-black tracking-widest">第 {(item as Joker).level || 1} 重</span>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white/5 px-2.5 py-2 rounded">
                                <span className="text-xs text-yellow-400 font-bold block mb-1">药效 / 功法:</span>
                                <span className="text-xs text-zinc-300">{(item as Consumable).effect}</span>
                            </div>
                        )}
                    </div>

                    {/* Lore/Description Section */}
                    <div className="border-t border-white/5 pt-3 mt-3">
                        <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                            "{item.description}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
