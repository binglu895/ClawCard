import React, { useState } from 'react';
import { GameState } from '../types';

interface StoryProps {
    state: GameState;
    onComplete: () => void;
}

export const DIALOGUES: Record<number, string[]> = {
    // --- 序章：囚笼 (Prologue) ---
    0: [
        "Welcome, Subject #9527. (欢迎，实验体 #9527。)",
        "Goal: Reach Year 99. Protocol: Ascension. (目标：抵达第 99 年。协议：飞升。)",
        "Do not look at the sky. Do not ask questions. (不要看天。不要发问。)"
    ],

    // --- 第一阶段：凡尘异象 (Phase 1: The Glitched Mortal World) ---
    1: [
        "Year 1: You pick up a rusted sword. (第 1 年：你拾起一把生锈的铁剑。)",
        "It feels heavy, but your hand clips through the handle for a second. (它很沉，但有一瞬间，你的手穿模穿过了剑柄。)",
        "Must be an illusion. (一定是错觉。)"
    ],
    3: [
        "Year 3: A beggar laughs at you. (第 3 年：一个乞丐对着你大笑。)",
        "'The textures! Look at the textures on that tree!' he screams. (‘材质！看那棵树的材质贴图！’他尖叫道。)",
        "You ignore him. Madness is common in the cultivation world. (你无视了他。在修仙界，疯子很常见。)"
    ],
    5: [
        "Year 5: You defeat a bandit. (第 5 年：你击败了一名山贼。)",
        "He repeats the same death line three times: 'Spare me... Spare me... Spare me...' (他把同一句遗言重复了三遍：‘饶命……饶命……饶命……’)",
        "Then he vanishes into static. (然后他化作雪花点消失了。)"
    ],
    8: [
        "Year 8: You find a Spirit Herb. (第 8 年：你发现了一株灵草。)",
        "It tastes like... burnt copper wire. (它尝起来像是……烧焦的铜线。)",
        "Your cultivation increases anyway. (不管怎样，你的修为增加了。)"
    ],
    10: [
        "Year 10: [Tribulation] The Sky Darkens. (第 10 年：【小天劫】天色暗了下来。)",
        "Thunder roars. It sounds like a distorted speaker blowing out. (雷声轰鸣。听起来像是爆音的劣质扬声器。)"
    ],
    13: [
        "Year 13: You return to your village. It is gone. (第 13 年：你回到故乡。村子不见了。)",
        "Not destroyed. Just... unloaded. A blank gray void sits there. (不是被毁了。只是……未加载。那里只有一片灰色的虚空。)",
        "You feel a headache splitting your skull. (你感到头痛欲裂。)"
    ],
    18: [
        "Year 18: A wandering cultivator attacks you. (第 18 年：一名散修袭击了你。)",
        "You strike his head. He doesn't bleed blood. He bleeds light. (你击中他的头部。他流的不是血。是光。)"
    ],
    22: [
        "Year 22: You hear a voice from the sky. (第 22 年：你听到了来自天空的声音。)",
        "'Server load stable. Proceed with batch 404.' (‘服务器负载稳定。继续处理 404 批次。’)",
        "Who is the 'Server'? (谁是‘服务器’？)"
    ],

    // --- 第二阶段：宗门养殖场 (Phase 2: The Sect Factory) ---
    25: [
        "Year 25: You join the 'Black Heaven Sect'. (第 25 年：你加入了‘黑天宗’。)",
        "Thousands of disciples sit in rows, absorbing Qi mechanically. (成千上万的弟子成排坐着，机械地吸收着灵气。)",
        "It looks less like a sect, and more like a server farm. (与其说是宗门，这里更像是一个服务器机房。)"
    ],
    28: [
        "Year 28: You meet Junior Sister 'Ling'. (第 28 年：你结识了小师妹‘灵’。)",
        "She has the exact same face as your mother. Same polygon count. (她长得和你死去的母亲一模一样。多边形数量都一样。)",
        "She smiles: 'This script... I mean, this fate is wonderful.' (她笑道：‘这剧本……我是说，这缘分真妙。’)"
    ],
    33: [
        "Year 33: The Sect Elder preaches. (第 33 年：宗门长老讲道。)",
        "'Discard your emotions. Optimize your throughput.' (‘抛弃情感。优化你们的吞吐量。’)",
        "Throughput? Did he mean Cultivation? (吞吐量？他是指修为吗？)"
    ],
    36: [
        "Year 36: Ling is crying. (第 36 年：灵在哭泣。)",
        "She shows you her arm. It's turning transparent. (她给你看她的手臂。正在变透明。)",
        "'I don't think I have enough memory allocated,' she whispers. (‘我觉得我被分配的内存不够了，’她低语道。)"
    ],
    40: [
        "Year 40: Ling is gone. (第 40 年：灵不见了。)",
        "No one remembers her. You check the sect registry. (没人记得她。你查阅宗门名册。)",
        "Entry #404: [DELETED_TO_SAVE_SPACE]. (条目 #404：[已删除以释放空间]。)",
        "Rage fills your heart. (愤怒填满了你的心。)"
    ],
    45: [
        "Year 45: You confront the Elder. (第 45 年：你质问长老。)",
        "His face flickers. For a second, he looks like a floating eye. (他的脸在闪烁。有一瞬间，他看起来像一只悬浮的眼球。)",
        "'You are a bug,' he says. 'A glitch.' (‘你是个 Bug，’他说。‘一个故障。’)"
    ],
    49: [
        "Year 49: You flee the Sect. (第 49 年：你逃离了宗门。)",
        "The world barrier is visible now. A grid of blue lasers. (世界屏障清晰可见。那是一张蓝色激光构成的网格。)"
    ],

    // --- 第三阶段：代码觉醒 (Phase 3: The Code Revealed) ---
    52: [
        "Year 52: Bounty hunters pursue you. (第 52 年：赏金猎人在追杀你。)",
        "They are 'Anti-Virus Programs' in human skin. (他们是披着人皮的‘杀毒程序’。)",
        "But your cards... they can rewrite their code. (但你手中的牌……可以重写他们的代码。)"
    ],
    55: [
        "Year 55: You find a 'Grotto-Heaven'. (第 55 年：你发现了一处‘洞天福地’。)",
        "It's actually a Developer Debug Room. (这里其实是开发者的调试屋。)",
        "Floating text reads: 'TODO: Fix physics engine.' (悬浮文字写着：‘待办：修复物理引擎。’)"
    ],
    60: [
        "Year 60: You realize the truth about Spirit Stones. (第 60 年：你意识到了灵石的真相。)",
        "They are compressed data packets of deleted souls. (它们是被删除灵魂的压缩数据包。)",
        "You have been spending ghosts to buy power. (你一直在花费鬼魂来购买力量。)"
    ],
    66: [
        "Year 66: [Major Glitch] The Sun turns blue. (第 66 年：【重大故障】太阳变成了蓝色。)",
        "System Message: 'Rendering Error. Reboot imminent.' (系统消息：‘渲染错误。即将重启。’)",
        "You must finish before the reboot. (你必须在重启前终结这一切。)"
    ],
    70: [
        "Year 70: An old man stops you. (第 70 年：一个老人拦住了你。)",
        "He claims to be a Player from the previous cycle. (他自称是上一个轮回的‘玩家’。)",
        "'Don't Ascend,' he warns. 'The port is a trap.' (‘别飞升，’他警告道。‘那个端口是个陷阱。’)"
    ],
    75: [
        "Year 75: You kill the old man. You had to. (第 75 年：你杀了那个老人。你不得不这么做。)",
        "He yielded a Legendary Artifact: 'Admin Key Fragment'. (他掉落了一件传说级法宝：‘管理员密钥碎片’。)",
        "Your karma is irrelevant. Only power matters. (善恶无关紧要。唯有力量永恒。)"
    ],

    // --- 第四阶段：系统崩坏 (Phase 4: System Apocalypse) ---
    80: [
        "Year 80: You are now a Virus. (第 80 年：你现在是一个病毒。)",
        "Every step you take corrupts the ground beneath you. (你踏出的每一步都在腐蚀脚下的土地。)",
        "The Simulation is trying to isolate you. (模拟程序试图隔离你。)"
    ],
    85: [
        "Year 85: The firewall manifests as the 'Four Heavenly Kings'. (第 85 年：防火墙化身为‘四大天王’挡在面前。)",
        "They speak in SQL queries. (他们说着数据库查询语言。)",
        "DELETE * FROM Players WHERE ID = 'You'. (删除 * 来自 玩家表 若 ID = '你'。)"
    ],
    88: [
        "Year 88: You shatter the firewall. (第 88 年：你粉碎了防火墙。)",
        "The sky is peeling off like old wallpaper. (天空像旧壁纸一样剥落。)",
        "Behind the sky, there is only a black screen and a cursor. (在天空之后，只有黑色的屏幕和光标。)"
    ],
    92: [
        "Year 92: The Administrator speaks directly to you. (第 92 年：管理员直接与你对话。)",
        "'Why do you struggle, little algorithm?' (‘为何挣扎，小小的算法？’)",
        "'I can offer you a premium partition. Eternal bliss.' (‘我可以给你一个高级分区。永恒的极乐。’)"
    ],
    95: [
        "Year 95: You reject the offer. (第 95 年：你拒绝了提议。)",
        "The world begins to format. Gravity reverses. (世界开始格式化。重力逆转。)",
        "Only 4 steps to the Core. (距离核心只剩 4 步。)"
    ],
    98: [
        "Year 98: The Final Gate. (第 98 年：最后一道门。)",
        "It is not a Golden Gate. It is a Command Prompt. (那不是金门。那是一个命令提示符。)",
        "Enter command: [DESTROY_FALSE_GOD]. (输入指令：[诛杀伪神]。)"
    ],
    99: [
        "Year 99: SYSTEM CRITICAL. (第 99 年：系统危急。)",
        "The 'God' stands before you. A mass of tangled cables and weeping faces. (‘神’站在你面前。那是一团纠缠的线缆和哭泣的人脸。)",
        "Time to Ascend... to the Real World. (是时候飞升了……去往真实世界。)"
    ]
};

export const Story: React.FC<StoryProps> = ({ state, onComplete }) => {
    const [lineIndex, setLineIndex] = useState(0);
    const currentDialogues = DIALOGUES[state.year] || DIALOGUES[0];

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
                <div className="w-48 h-48 rounded-full bg-zinc-800 border-2 border-primary/50 mb-12 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(37,140,244,0.3)]">
                    <span className="material-symbols-outlined text-7xl text-primary animate-pulse">account_circle</span>
                </div>

                <div className="w-full bg-zinc-900/80 border border-white/10 p-10 rounded-3xl min-h-[200px] flex flex-col justify-between shadow-2xl relative">
                    <div className="absolute -top-3 left-10 px-4 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                        The Heavenly System (天道系统)
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
