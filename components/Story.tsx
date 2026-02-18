import React, { useState, useEffect } from 'react';
import { GameState } from '../types';

interface StoryProps {
    state: GameState;
    onComplete: () => void;
}

const DIALOGUES: Record<number, string[]> = {
    0: [
        "Welcome to the Neon Underground. (欢迎来到霓虹地下城。)",
        "Here, poker isn't just a game. It's survival. (在这里，扑克不仅是游戏，更是生存。)",
        "Win enough chips to pass the blinds, or get crushed by the system. (赢取足够的筹码来通过盲注，否则将被系统粉碎。)",
        "Check the shop for Jokers. They're your only edge. (去商店看看小丑牌，那是你唯一的优势。)"
    ],
    1: [
        "You passed the first Ante. Not bad. (你通过了第一个底注阶级。还不错。)",
        "But the system is scaling. The goals will grow faster now. (但系统正在升级。目标现在会增长得更快。)",
        "Keep your wits about you. (保持警惕。)"
    ]
};

export const Story: React.FC<StoryProps> = ({ state, onComplete }) => {
    const [lineIndex, setLineIndex] = useState(0);
    const currentDialogues = DIALOGUES[state.storyProgress] || ["The journey continues... (旅程继续...)"];

    const handleNext = () => {
        if (lineIndex < currentDialogues.length - 1) {
            setLineIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-700">
            <div className="max-w-3xl w-full p-12 flex flex-col items-center">
                {/* Character Portrait Placeholder */}
                <div className="w-48 h-48 rounded-full bg-zinc-800 border-2 border-primary/50 mb-12 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(37,140,244,0.3)]">
                    <span className="material-symbols-outlined text-7xl text-primary animate-pulse">account_circle</span>
                </div>

                <div className="w-full bg-zinc-900/80 border border-white/10 p-10 rounded-3xl min-h-[200px] flex flex-col justify-between shadow-2xl relative">
                    <div className="absolute -top-3 left-10 px-4 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                        The Dealer (发牌员)
                    </div>

                    <p className="text-2xl font-medium text-white leading-relaxed mb-8 animate-in slide-in-from-bottom-2 duration-500">
                        {currentDialogues[lineIndex]}
                    </p>

                    <button
                        onClick={handleNext}
                        className="self-end px-8 py-3 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95"
                    >
                        {lineIndex < currentDialogues.length - 1 ? "Next (继续)" : "Begin (开始)"}
                    </button>
                </div>
            </div>
        </div>
    );
};
