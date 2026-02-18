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
        "Overcome the tribulations of each year, or be consumed by the chaos. (渡过每年的劫难，否则你将被混沌吞噬。)",
        "Equip Artifacts to your five vital centers. They are your shield and sword. (将法宝装备于你的五大要穴。它们是你的盾与剑。)"
    ],
    1: [
        "You have survived the initial gathering of Chi. (你已平安渡过聚气期。)",
        "The heavens are watching your progress. The tribulations will grow heavier. (上天在注视着你的进步。劫难将变得更加沉重。)",
        "Strengthen your artifacts. The path only gets steeper. (强化你的法宝。前方的路只会更加陡峭。)"
    ],
    2: [
        "Foundation established. You are no longer a mere mortal. (筑基已成。你不再是一介凡夫。)",
        "The Spirit Stones you gather will fuel your ascension. (你收集的灵石将助你升仙。)",
        "Do not let the neon lights of the old world blind your inner eye. (莫让旧世界的霓虹灯火迷了你的心智。)"
    ],
    3: [
        "Golden Core formed. A beacon of light in the data void. (金丹结成。数据虚空中的一盏明灯。)",
        "The Grand Arbitrator is mobilizing the system firewall. (大仲裁官正在动员系统防火墙。)",
        "Equip yourself with Rare Artifacts to pierce through the corruption. (装备稀有法宝，刺破腐朽。)"
    ],
    4: [
        "Nascent Soul emerged. You are one with the flow. (元婴显现。你与道合一。)",
        "Can you feel the 99 years of destiny pulling you forward? (你能感觉到 99 年的宿命在拉你前行吗？)",
        "The higher you climb, the harder the fall. Balance is key. (爬得越高，摔得越重。平衡是关键。)"
    ],
    5: [
        "Ante 5. The system is screaming. Financial markets are in chaos. (Ante 5。系统在痛苦尖叫。金融市场陷入一片混乱。)",
        "You're not just a gambler anymore. You're a systemic risk. (你不再只是个赌徒。你是系统性风险。)",
        "One wrong discard, and the firewall will crush your consciousness. (一次错误的弃牌，防火墙就会粉碎你的意识。)"
    ],
    6: [
        "The penultimate layer. The air smells like ozone and scorched silicon. (倒数第二层。空气中弥漫着臭氧和烧焦的硅片味。)",
        "Everything you've built comes down to this. Your deck is your only weapon. (你建立的一切都归结于此。你的卡组是你唯一的武器。)",
        "The Grand Arbitrator is preparing for your arrival. (大仲裁官正在为你的到来做准备。)"
    ],
    7: [
        "You've reached the threshold. (你已经到达了门槛。)",
        "Did you ever wonder why I'm helping you, Glitcher? (你有没有想过我为什么要帮你，漏洞者？)",
        "I was the first to try. Now, I'm just the one who deals the cards. (我是第一个尝试的人。现在，我只是那个发牌的人。)",
        "Go. Finish what I couldn't. (去吧。完成我没能完成的事。)"
    ],
    8: [
        "The Grand Arbitrator awaits. The financial heart is exposed. (大仲裁官就在前方。金融心脏已经暴露。)",
        "One final overload. One final hand. (最后一次过载。最后一手牌。)",
        "For a world without these neon chains. (为了一个没有这些霓虹枷锁的世界。)",
        "LET'S END THIS. (让我们结束这一切。)"
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
