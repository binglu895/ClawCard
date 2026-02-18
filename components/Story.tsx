import React, { useState, useEffect } from 'react';
import { GameState } from '../types';

interface StoryProps {
    state: GameState;
    onComplete: () => void;
}

const DIALOGUES: Record<number, string[]> = {
    0: [
        "Welcome to the Neon Underground. (欢迎来到霓虹地下城。)",
        "Here, poker isn't just a game. It's a glitch in the financial matrix. (在这里，扑克不仅是游戏。它是金融母体的一个漏洞。)",
        "Win enough chips to overload the local node, or get deleted by the system. (赢取足够的筹码来过载本地节点，否则你将被系统删除。)",
        "Check the shop for Jokers. They're your payloads. Use them wisely. (去商店看看小丑牌。它们是你的加力载荷。明智地使用它们。)"
    ],
    1: [
        "First Ante breached. The system is starting to log your activity. (第一个底注阶级已突破。系统开始记录你的活动。)",
        "Security protocols are scaling. The score targets will grow faster now. (安防协议正在升级。分数目标现在会增长得更快。)",
        "Don't get cocky. The Watchers are beginning to take interest. (别自大。监视者们开始对你感兴趣了。)"
    ],
    2: [
        "Ante 2 down. You're becoming a significant anomaly. (通过了 Ante 2。你正在变成一个显著的异常。)",
        "The financial district is feeling the heat. They're deploying 'Boss Blinds' to stop you. (金融区感到了压力。他们正在部署“首领盲注”来阻止你。)",
        "Break their rules, or they'll break you. (打破他们的规则，否则他们会粉碎你。)"
    ],
    3: [
        "Still alive? Impressive. (还活着？令人印象深刻。)",
        "You're skimming millions off the accounts. The Grand Arbitrator won't be happy. (你正从账户中窃取数百万资金。大仲裁官不会高兴的。)",
        "The shop is getting more specialized. Look for the 'Rare' payloads. (商店正变得越来越专业。寻找那些“稀有”的载荷。)"
    ],
    4: [
        "Halfway through the core. Can you feel the rush of the data stream? (核心进度过半。你能感觉到数据流的冲击吗？)",
        "Many have come this far and traded their souls for a few extra Mults. (许多来到这里的人为了额外的倍率而交易了他们的灵魂。)",
        "Keep your focus. The deeper we go, the more the void stares back. (保持专注。我们走得越深，虚空的回响就越响亮。)"
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
