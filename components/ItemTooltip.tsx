import React from 'react';
import { Joker } from '../types';
import { GET_JOKER_EFFECT_DISPLAY, GET_ITEM_TIER } from '../gameLogic';

export const ItemTooltip: React.FC<{ item: Joker; children: React.ReactNode }> = ({ item, children }) => {
    const tier = GET_ITEM_TIER(item.id);
    const tierNames = ["", "翠竹 (Tier 1)", "玄铁 (Tier 2)", "吐纳 (Tier 3)", "乾坤 (Tier 4)", "无我 (Tier 5)"];

    return (
        <div className="relative group cursor-pointer">
            {/* The Item itself */}
            {children}

            {/* The Tooltip (Classic RPG Style) */}
            <div className="absolute z-[100] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-[#1a1a1a]/95 border border-[#333] rounded-md p-4 shadow-2xl backdrop-blur-md pointer-events-none">

                {/* Header */}
                <div className="border-b border-[#333] pb-2 mb-2">
                    <h4 className="text-lg font-bold text-white tracking-wide">{item.name}</h4>
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-zinc-400 bg-black/50 px-2 py-0.5 rounded">
                            部位: {item.slot}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                            {tierNames[tier]}
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="text-xs space-y-2 my-3">
                    <p className="text-zinc-500 font-bold">[基础属性]</p>
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-300">核心词条</span>
                        <span className="text-green-400 font-bold">{GET_JOKER_EFFECT_DISPLAY(item)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-300">当前境界</span>
                        <span className="text-blue-300">第 {item.level || 1} 重</span>
                    </div>
                </div>

                {/* Description / Lore */}
                <div className="border-t border-[#333] pt-2 mt-2">
                    <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                        "{item.description}"
                    </p>
                </div>
            </div>
        </div>
    );
};
