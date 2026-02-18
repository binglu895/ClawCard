import React, { useState, useEffect } from 'react';
import { GameState } from '../types';

interface StoryProps {
    state: GameState;
    onComplete: () => void;
}

const DIALOGUES: Record<number, string[]> = {
    0: [
        "Welcome to the Path of Immortality. (欢迎踏上寻仙之路。)",
        "Here, your Tao is not just a score. It is your essence. (在这里，你的道行不仅是分数。它是你的本原。)",
        "Reach Year 99 and ascend to the heavens. (修行至第 99 年，即可飞升上界。)"
    ],
    // Phase A (1-30): Traditional Cultivation
    1: ["The first step is always the hardest. (万事开头难。)", "Refine your Qi, steady your mind. (聚气归元，稳固心神。)"],
    2: ["Foundation established. You are no longer a mere mortal. (筑基已成。你不再是一介凡夫。)", "The world seems simple and bright. (这个世界看起来既单纯又明亮。)"],
    3: ["Golden Core formed. A major milestone in your path. (金丹结成。你修行路上的重要里程碑。)"],

    // Phase B (31-60): Betrayal & Horror
    10: [
        "Something is wrong. You saw a bird disappear mid-flight. (有些不对劲。你看到一只鸟在飞翔中凭空消失了。)",
        "Just a glitch in your perception... surely. (那一定只是你感知上的一个小故障……大概吧。)"
    ],
    15: [
        "The villagers... they repeat the exact same motions every day. (那些村民……他们每天都在重复完全相同的动作。)",
        "Are they even alive? Or are they just... objects? (他们真的活着吗？还是说他们只是……物件？)"
    ],
    20: [
        "SYSTEM_NOTICE: Harvesting efficiency at 92%. (系统提示：收割效率 92%。)",
        "You heard a voice in your head. It didn't sound like a god. (你脑海中响起了一个声音。听起来不像是神迹。)"
    ],

    // Phase C (61-90): The Truth
    25: [
        "The 'Heavens' are just a massive array of silicon and light. (所谓的‘上界’，不过是硅片与光芒构成的宏大阵法。)",
        "We are being raised like cattle. Ascension is the slaughterhouse. (我们像牲口一样被圈养。‘飞升’即是屠宰场。)"
    ],
    30: [
        "The fabric of reality is tearing. You can see the code underlying the mountains. (现实的织锦正在撕裂。你能看见山川之下的代码。)",
        "Everything is a lie. Breaking the Matrix is the only way out. (一切都是谎言。打破矩阵是唯一的出路。)"
    ],

    // Phase D (91-99)
    32: [
        "The Heavenly Code has detected your awakening. (上苍代码已察觉到你的觉醒。)",
        "Year 99 is a cage. Fight your way to the exit. (第 99 年是一个囚笼。杀向出口。)"
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
