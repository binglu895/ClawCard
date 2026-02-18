import { CardData, PokerHand, Enhancement, Edition, Seal, Suit, Joker, Consumable, GameEvent, Choice, GameState } from './types';

export const EVALUATE_HAND = (cards: CardData[]): PokerHand => {
    const counts: Record<string, number> = {};
    const suits: Record<string, number> = {};
    const ranks: number[] = [];

    cards.forEach(card => {
        const rankValue = card.rank === 'A' ? 14 : card.rank === 'K' ? 13 : card.rank === 'Q' ? 12 : card.rank === 'J' ? 11 : card.rank === '10' ? 10 : parseInt(card.rank);
        counts[card.rank] = (counts[card.rank] || 0) + 1;
        suits[card.suit] = (suits[card.suit] || 0) + 1;
        ranks.push(rankValue);
    });

    ranks.sort((a, b) => b - a);

    const isFlush = Object.values(suits).some(s => s === 5);
    let isStraight = false;
    if (cards.length === 5) {
        const uniqueRanks = [...new Set(ranks)];
        if (uniqueRanks.length === 5) {
            if (ranks[0] - ranks[4] === 4) isStraight = true;
            if (ranks[0] === 14 && ranks[1] === 5 && ranks[4] === 2) isStraight = true; // A-5 Straight
        }
    }

    const countList = Object.values(counts).sort((a, b) => b - a);

    if (countList[0] === 5) return "Five of a Kind";
    if (isFlush && isStraight) return ranks[0] === 14 && ranks[1] === 13 ? "Royal Flush" : "Straight Flush";
    if (countList[0] === 4) return "Four of a Kind";
    if (countList[0] === 3 && countList[1] === 2) return "Full House";
    if (isFlush) return "Flush";
    if (isStraight) return "Straight";
    if (countList[0] === 3) return "Three of a Kind";
    if (countList[0] === 2 && countList[1] === 2) return "Two Pair";
    if (countList[0] === 2) return "Pair";
    return "High Card";
};

export const GET_HAND_STATS = (hand: PokerHand, level: number): { chips: number, mult: number } => {
    const baseStats: Record<PokerHand, { chips: number, mult: number, sChips: number, sMult: number }> = {
        "Royal Flush": { chips: 100, mult: 8, sChips: 40, sMult: 4 },
        "Straight Flush": { chips: 100, mult: 8, sChips: 40, sMult: 4 },
        "Five of a Kind": { chips: 120, mult: 12, sChips: 40, sMult: 4 },
        "Four of a Kind": { chips: 60, mult: 7, sChips: 30, sMult: 3 },
        "Full House": { chips: 40, mult: 4, sChips: 25, sMult: 2 },
        "Flush": { chips: 35, mult: 4, sChips: 15, sMult: 2 },
        "Straight": { chips: 30, mult: 4, sChips: 30, sMult: 2 },
        "Three of a Kind": { chips: 30, mult: 3, sChips: 20, sMult: 2 },
        "Two Pair": { chips: 20, mult: 2, sChips: 20, sMult: 1 },
        "Pair": { chips: 10, mult: 2, sChips: 15, sMult: 1 },
        "High Card": { chips: 5, mult: 1, sChips: 10, sMult: 1 }
    };

    const stats = baseStats[hand];
    return {
        chips: stats.chips + (level - 1) * stats.sChips,
        mult: stats.mult + (level - 1) * stats.sMult
    };
};

export const CALCULATE_CARD_CHIPS = (card: CardData): number => {
    if (card.enhancement === Enhancement.Stone) return 50;
    const rankValue = card.rank === 'A' ? 11 : ['K', 'Q', 'J', '10'].includes(card.rank) ? 10 : parseInt(card.rank);
    let bonus = 0;
    if (card.enhancement === Enhancement.Bonus) bonus = 30;
    return rankValue + bonus;
};

export const CALCULATE_CARD_MULT = (card: CardData): number => {
    let mult = 0;
    if (card.edition === Edition.Foil) mult += 10;
    if (card.enhancement === Enhancement.Mult) mult += 4;
    return mult;
};

export const CALCULATE_CARD_X_MULT = (card: CardData): number => {
    let xMult = 1.0;
    if (card.edition === Edition.Polychrome) xMult *= 1.5;
    if (card.enhancement === Enhancement.Glass) xMult *= 2.0;
    return xMult;
};

export const GENERATE_DECK = (): CardData[] => {
    const suits: Suit[] = ['SPADES', 'HEARTS', 'DIAMONDS', 'CLUBS'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck: CardData[] = [];
    let id = 1;

    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push({
                id: (id++).toString(),
                suit,
                rank,
                enhancement: Enhancement.None,
                edition: Edition.None,
                seal: Seal.None
            });
        });
    });

    return deck.sort(() => Math.random() - 0.5);
};

export const SORT_CARDS_BY_RANK = (cards: CardData[]): CardData[] => {
    const rankOrder: Record<string, number> = {
        'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
    };
    return [...cards].sort((a, b) => rankOrder[b.rank] - rankOrder[a.rank]);
};

export const CALCULATE_GOAL = (ante: number, round: number): number => {
    const base = 300;
    const roundMultiplier = round === 3 ? 2 : round === 2 ? 1.5 : 1;
    return Math.floor(base * Math.pow(2.5, ante - 1) * roundMultiplier);
};

export const GENERATE_SHOP_ITEMS = (ante: number): { jokers: Joker[], consumables: Consumable[] } => {
    const jokers: Joker[] = [];
    const pool = [...JOKER_POOL];
    for (let i = 0; i < 2; i++) {
        if (pool.length > 0) {
            const idx = Math.floor(Math.random() * pool.length);
            jokers.push({ ...pool[idx], id: `shop_joker_${Math.random()}` });
            pool.splice(idx, 1);
        }
    }

    const consumables: Consumable[] = [];
    const cPool = [...CONSUMABLE_POOL];
    for (let i = 0; i < 2; i++) {
        if (cPool.length > 0) {
            const idx = Math.floor(Math.random() * cPool.length);
            consumables.push({ ...cPool[idx], id: `shop_c_${Math.random()}` });
        }
    }

    return { jokers, consumables };
};

export const JOKER_POOL: Joker[] = [
    // --- 1. 翠竹套装 (Verdant Set) - 入门级/Common ---
    { id: 'j_v_head', name: 'Verdant Hat (翠竹笠)', rarity: 'Common', level: 1, slot: 'Head', price: 2, effect: '+10 Tao', description: '新手入门的防具，散发着竹香。' },
    { id: 'j_v_hand', name: 'Verdant Staff (翠竹杖)', rarity: 'Common', level: 1, slot: 'Hand', price: 2, effect: '+2 Mult', description: '轻便的竹杖，勉强可以防身。' },
    { id: 'j_v_leg', name: 'Verdant Shoes (翠竹履)', rarity: 'Common', level: 1, slot: 'Leg', price: 2, effect: '+5 Tao per card played', description: '走起路来脚下生风。' },
    { id: 'j_v_body', name: 'Verdant Robe (翠竹衣)', rarity: 'Common', level: 1, slot: 'Body', price: 2, effect: '+15 Tao', description: '普通的竹编护甲。' },
    { id: 'j_v_acc', name: 'Verdant Charm (翠竹坠)', rarity: 'Common', level: 1, slot: 'Accessory', price: 2, effect: '+2 Mult', description: '刻着平安二字的竹牌。' },

    // --- 2. 玄铁套装 (Dark Iron Set) - 进阶级/Common-Uncommon ---
    { id: 'j_i_head', name: 'Iron Helm (玄铁盔)', rarity: 'Common', level: 1, slot: 'Head', price: 4, effect: '+30 Tao', description: '沉重的头盔，能抵挡重击。' },
    { id: 'j_i_hand', name: 'Iron Sword (玄铁剑)', rarity: 'Common', level: 1, slot: 'Hand', price: 5, effect: 'Spades & Clubs give +4 Mult', description: '大巧不工，重剑无锋。' },
    { id: 'j_i_leg', name: 'Iron Boots (玄铁靴)', rarity: 'Common', level: 1, slot: 'Leg', price: 5, effect: 'Even cards give +30 Tao', description: '每一步都在地面留下深坑。' },
    { id: 'j_i_body', name: 'Iron Armor (玄铁甲)', rarity: 'Uncommon', level: 1, slot: 'Body', price: 6, effect: '+50 Tao, -1 Discard', description: '防御极高，但行动笨拙。' },
    { id: 'j_i_acc', name: 'Iron Ring (玄铁戒)', rarity: 'Uncommon', level: 1, slot: 'Accessory', price: 5, effect: '+5 Mult if hand contains Pair', description: '指环上刻着杀伐之气。' },

    // --- 3. 吐纳套装 (Breath Set) - 高手级/Uncommon ---
    { id: 'j_b_head', name: 'Breath Band (吐纳巾)', rarity: 'Uncommon', level: 1, slot: 'Head', price: 6, effect: '+10 Tao per remaining hand', description: '帮助在战斗中保持冷静。' },
    { id: 'j_b_hand', name: 'Breath Palm (吐纳掌)', rarity: 'Uncommon', level: 1, slot: 'Hand', price: 7, effect: '+1 Mult per card in deck', description: '每一掌都蕴含着内力。' },
    { id: 'j_b_leg', name: 'Breath Steps (吐纳步)', rarity: 'Uncommon', level: 1, slot: 'Leg', price: 7, effect: 'Retrigger first played card', description: '身法飘忽，残影重重。' },
    { id: 'j_b_body', name: 'Breath Robe (吐纳袍)', rarity: 'Uncommon', level: 1, slot: 'Body', price: 8, effect: 'Gain $1 per hand played', description: '吸收天地灵气转化为财富。' },
    { id: 'j_b_acc', name: 'Breath Bead (吐纳珠)', rarity: 'Uncommon', level: 1, slot: 'Accessory', price: 8, effect: '+0.5 Mult per $1 owned', description: '财侣法地，财为第一。' },

    // --- 4. 乾坤套装 (Cosmic Set) - 宗师级/Rare ---
    { id: 'j_c_head', name: 'Cosmic Crown (乾坤冠)', rarity: 'Rare', level: 1, slot: 'Head', price: 10, effect: '+150 Tao', description: '冠绝天下，道法自然。' },
    { id: 'j_c_hand', name: 'Cosmic Seal (乾坤印)', rarity: 'Rare', level: 1, slot: 'Hand', price: 12, effect: '+15 Mult', description: '一印既出，镇压山河。' },
    { id: 'j_c_leg', name: 'Cosmic Stride (乾坤踏)', rarity: 'Rare', level: 1, slot: 'Leg', price: 12, effect: 'Retrigger all face cards', description: '一步踏出，缩地成寸。' },
    { id: 'j_c_body', name: 'Cosmic Armor (乾坤铠)', rarity: 'Rare', level: 1, slot: 'Body', price: 15, effect: '+2 Hand Size', description: '内蕴乾坤，包罗万象。' },
    { id: 'j_c_acc', name: 'Cosmic Mirror (乾坤镜)', rarity: 'Rare', level: 1, slot: 'Accessory', price: 12, effect: 'x2 Mult on final hand', description: '镜花水月，虚实难测。' },

    // --- 5. 无我套装 (Nirvana Set) - 飞升级/Legendary ---
    { id: 'j_n_head', name: 'Nirvana Visage (无我相)', rarity: 'Rare', level: 1, slot: 'Head', price: 20, effect: 'x1.5 Mult', description: '无我无相，众生皆苦。' },
    { id: 'j_n_hand', name: 'Nirvana Finger (无我指)', rarity: 'Rare', level: 1, slot: 'Hand', price: 20, effect: 'Played cards give x1.2 Mult', description: '一指寂灭，万法皆空。' },
    { id: 'j_n_leg', name: 'Nirvana Walk (无我行)', rarity: 'Rare', level: 1, slot: 'Leg', price: 20, effect: 'x3 Mult if played Flush', description: '大道独行。' },
    { id: 'j_n_body', name: 'Nirvana Body (无我身)', rarity: 'Rare', level: 1, slot: 'Body', price: 25, effect: 'x0.2 Mult per Tarot used', description: '肉身成圣，万劫不磨。' },
    { id: 'j_n_acc', name: 'Nirvana Heart (无我心)', rarity: 'Rare', level: 1, slot: 'Accessory', price: 25, effect: 'x1.1 Mult per year passed', description: '心如止水，映照万物。' },
];

export const GET_JOKER_STATS = (joker: Joker, state: GameState, selectedCards: CardData[], currentHand: PokerHand): { tao: number, mult: number, xMult: number } => {
    let tao = 0;
    let mult = 0;
    let xMult = 1.0;

    const isFace = (rank: string) => ['J', 'Q', 'K'].includes(rank);
    const isEven = (rank: string) => ['2', '4', '6', '8', '10', 'Q'].includes(rank);

    switch (joker.id) {
        // Verdant Set
        case 'j_v_head': tao += 10; break;
        case 'j_v_hand': mult += 2; break;
        case 'j_v_leg': tao += 5 * selectedCards.length; break;
        case 'j_v_body': tao += 15; break;
        case 'j_v_acc': mult += 2; break;

        // Iron Set
        case 'j_i_head': tao += 30; break;
        case 'j_i_hand':
            const ironSuits = selectedCards.filter(c => c.suit === 'SPADES' || c.suit === 'CLUBS').length;
            mult += 4 * ironSuits;
            break;
        case 'j_i_leg':
            const evenCards = selectedCards.filter(c => isEven(c.rank)).length;
            tao += 30 * evenCards;
            break;
        case 'j_i_body': tao += 50; break;
        case 'j_i_acc':
            if (currentHand.includes('Pair') || currentHand.includes('Kind') || currentHand === 'Full House') mult += 5;
            break;

        // Breath Set
        case 'j_b_head': tao += 10 * state.handsLeft; break;
        case 'j_b_hand': mult += 1 * state.deck.length; break;
        case 'j_b_leg': break; // Retrigger handled in main loop
        case 'j_b_body': break; // $1 handled in handlePlayHand
        case 'j_b_acc': mult += 0.5 * state.spiritStones; break;

        // Cosmic Set
        case 'j_c_head': tao += 150; break;
        case 'j_c_hand': mult += 15; break;
        case 'j_c_leg': break; // Retrigger handled in main loop
        case 'j_c_body': break; // Hand Size handled in INITIAL_STATE and re-draw
        case 'j_c_acc': if (state.handsLeft === 1) xMult *= 2; break;

        // Nirvana Set
        case 'j_n_head': xMult *= 1.5; break;
        case 'j_n_hand': xMult *= Math.pow(1.2, selectedCards.length); break;
        case 'j_n_leg': if (currentHand === 'Flush') xMult *= 3; break;
        case 'j_n_body': xMult *= (1 + 0.2 * state.consumablesUsed); break;
        case 'j_n_acc': xMult *= Math.pow(1.1, state.year); break;
    }

    return { tao, mult, xMult };
};

export const GET_JOKER_EFFECT_DISPLAY = (joker: Joker): string => {
    return joker.effect;
};

export const CONSUMABLE_POOL: Consumable[] = [
    { id: 'c_mercury', name: 'Spirit Tea (灵茶)', type: 'Planet', price: 3, effect: 'Level up High Card', description: '清香提神，小幅提升悟性。' },
    { id: 'c_venus', name: 'Dew Pill (甘露丹)', type: 'Planet', price: 3, effect: 'Level up One Pair', description: '采集清晨甘露凝聚而成。' },
    { id: 'c_earth', name: 'Earth Spirit Pill (地灵丹)', type: 'Planet', price: 3, effect: 'Level up Two Pair', description: '蕴含厚重的大地之力。' },
    { id: 'c_mars', name: 'Blood Qi Pill (血气丹)', type: 'Planet', price: 3, effect: 'Level up Three of a Kind', description: '沸腾气血，勇往直前。' },
    { id: 'c_jupiter', name: 'Thunder Spirit Pill (雷灵丹)', type: 'Planet', price: 3, effect: 'Level up Straight', description: '引天雷淬炼，破而后立。' },
    { id: 'c_saturn', name: 'Void Pill (太虚丹)', type: 'Planet', price: 3, effect: 'Level up Flush', description: '意入太虚，万法归一。' },
    { id: 'c_uranus', name: 'Clear Sky Pill (净天丹)', type: 'Planet', price: 3, effect: 'Level up Full House', description: '洗净铅华，返璞归真。' },
    { id: 'c_neptune', name: 'Vast Ocean Pill (瀚海丹)', type: 'Planet', price: 3, effect: 'Level up Four of a Kind', description: '心怀万象，深不可测。' },
    { id: 'c_pluto', name: 'Dragon Soul Pill (龙魂丹)', type: 'Planet', price: 3, effect: 'Level up Straight Flush', description: '真龙之魂，傲视群雄。' },
    { id: 'c_fool', name: 'Mirror Image (镜像术)', type: 'Tarot', price: 3, effect: 'Duplicate last used consumable', description: '镜中花，水中月。' },
    { id: 'c_magician', name: 'Spirit Fire (灵火咒)', type: 'Tarot', price: 4, effect: 'Enhance 2 cards to Bonus', description: '以灵火淬炼卡牌。' },
    { id: 'c_high_priestess', name: 'Spring Rain (春雨术)', type: 'Tarot', price: 3, effect: 'Generate 2 Random Elixirs', description: '春风化雨，润物无声。' },
    { id: 'c_empress', name: 'Thunderbolt (雷霆符)', type: 'Tarot', price: 4, effect: 'Enhance 2 cards to Mult', description: '雷霆之怒，无坚不摧。' },
    { id: 'c_emperor', name: 'Insight (通明感应)', type: 'Tarot', price: 3, effect: 'Generate 2 Random Scrolls', description: '慧眼识珠，灵感迸发。' },
    { id: 'c_hierophant', name: 'Steel Skin (金刚护体)', type: 'Tarot', price: 4, effect: 'Enhance 2 cards to Steel', description: '坚如磐石，不动如山。' },
    { id: 'c_lovers', name: 'Wild Growth (万木生发)', type: 'Tarot', price: 4, effect: 'Enhance 1 card to Wild', description: '生机勃勃，变幻莫测。' },
    { id: 'c_chariot', name: 'Wind Walk (御风术)', type: 'Tarot', price: 4, effect: 'Enhance 1 card to Glass', description: '乘风而去，瞬息万里。' },
    { id: 'c_justice', name: 'Gilded Body (金身咒)', type: 'Tarot', price: 4, effect: 'Enhance 1 card to Gold', description: '点石成金，富贵逼人。' },
    { id: 'c_world', name: 'Stars Alignment (星辰变)', type: 'Tarot', price: 4, effect: 'Convert 3 cards to Spades', description: '移星换斗，改天换日。' },
    { id: 'c_sun', name: 'Solar Flare (烈阳真意)', type: 'Tarot', price: 4, effect: 'Convert 3 cards to Hearts', description: '烈阳当空，诸邪避让。' },
    { id: 'c_moon', name: 'Moonlight (冷月清辉)', type: 'Tarot', price: 4, effect: 'Convert 3 cards to Clubs', description: '清辉遍洒，万籁俱寂。' },
    { id: 'c_star', name: 'Starfall (陨星碎)', type: 'Tarot', price: 4, effect: 'Convert 3 cards to Diamonds', description: '星陨如雨，碎裂虚空。' }
];

export const EVENT_POOL: GameEvent[] = [
    {
        id: 'e_beggar',
        title: 'The Starving Beggar (饥饿的乞丐)',
        description: 'You meet an old man on the road, trembling with hunger. (你在路边遇到一个饿得发抖的老人。)',
        choices: [
            {
                label: 'Give Spirit Stones (施舍灵石)',
                description: '-5 Spirit Stones, +5 Karma (消耗5灵石，增加5善缘)',
                effect: (s) => ({ spiritStones: s.spiritStones - 5, karma: s.karma + 5 })
            },
            {
                label: 'Give Food (施舍食物)',
                description: '+2 Karma (增加2善缘)',
                effect: (s) => ({ karma: s.karma + 2 })
            },
            {
                label: 'Ignore (无视)',
                description: 'None (无影响)',
                effect: () => ({})
            }
        ]
    },
    {
        id: 'e_cave',
        title: 'Ancient Cave (古修洞府)',
        description: 'You find a hidden entrance to an ancient cave. A dark aura emanates from within. (你发现了一个古老洞府的入口，一股黑气若隐若现。)',
        choices: [
            {
                label: 'Enter Boldly (闯入)',
                description: '+5 Obsession, Random Artifact (增加5执念，随机获得一件法宝)',
                effect: (s) => {
                    const jokers = JOKER_POOL.filter(j => j.rarity !== 'Legendary');
                    const randomJoker = jokers[Math.floor(Math.random() * jokers.length)];
                    const slots: Array<keyof GameState['equipment']> = ['Head', 'Hand', 'Leg', 'Body', 'Accessory'];
                    const emptySlot = slots.find(slot => s.equipment[slot] === null);
                    const newEquipment = { ...s.equipment };
                    if (emptySlot) {
                        newEquipment[emptySlot] = { ...randomJoker, id: `e_joker_${Math.random()}` };
                    }
                    return { obsession: s.obsession + 5, equipment: newEquipment };
                }
            },
            {
                label: 'Purify Entrance (净化入口)',
                description: '+10 Karma, -2 Spirit Stones (增加10善缘，消耗2灵石)',
                effect: (s) => ({ karma: s.karma + 10, spiritStones: s.spiritStones - 2 })
            },
            {
                label: 'Leave (离开)',
                description: 'Safety first. (安全第一)',
                effect: () => ({})
            }
        ]
    },
    {
        id: 'e_market',
        title: 'Black Market Fair (地下拍卖会)',
        description: 'A shadowy figure invites you to a secret auction. (一个蒙面人邀请你参加秘密拍卖会。)',
        choices: [
            {
                label: 'Participate (参加)',
                description: '+5 Reputation, -10 Spirit Stones (增加5声望，消耗10灵石)',
                effect: (s) => ({ reputation: s.reputation + 5, spiritStones: s.spiritStones - 10 })
            },
            {
                label: 'Infiltrate (潜入)',
                description: '-5 Reputation, +5 Obsession, Random Scroll (减少5声望，增加5执念，随机获得一卷锦囊)',
                effect: (s) => {
                    const scrolls = CONSUMABLE_POOL.filter(c => c.type === 'Tarot');
                    const randomScroll = scrolls[Math.floor(Math.random() * scrolls.length)];
                    const newConsumables = [...s.consumables];
                    if (newConsumables.length < 2) {
                        newConsumables.push({ ...randomScroll, id: `e_scroll_${Math.random()}` });
                    }
                    return { reputation: s.reputation - 5, obsession: s.obsession + 5, consumables: newConsumables };
                }
            },
            {
                label: 'Report to Sect (上报宗门)',
                description: '+10 Reputation, +2 Karma (增加10声望，增加2善缘)',
                effect: (s) => ({ reputation: s.reputation + 10, karma: s.karma + 2 })
            }
        ]
    }
];

export const GET_RANDOM_EVENT = (): GameEvent => {
    return EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
};
