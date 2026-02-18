import { CardData, PokerHand, Enhancement, Edition, Seal, Suit, Joker, Consumable } from './types';

export const EVALUATE_HAND = (cards: CardData[]): PokerHand => {
    const counts: Record<string, number> = {};
    const suits: Record<string, number> = {};
    const ranks: number[] = [];

    cards.forEach(card => {
        counts[card.rank] = (counts[card.rank] || 0) + 1;
        suits[card.suit] = (suits[card.suit] || 0) + 1;
        const r = card.rank === 'A' ? 14 : card.rank === 'K' ? 13 : card.rank === 'Q' ? 12 : card.rank === 'J' ? 11 : parseInt(card.rank);
        ranks.push(r);
    });

    const sortedRanks = [...ranks].sort((a, b) => a - b);

    // Wild cards can be any suit
    const nonWildCards = cards.filter(c => c.enhancement !== Enhancement.Wild);
    const distinctSuits = new Set(nonWildCards.map(c => c.suit));
    const isFlush = cards.length === 5 && distinctSuits.size <= 1;

    const isStraight = cards.length === 5 && sortedRanks.every((r, i) => i === 0 || r === sortedRanks[i - 1] + 1);
    const countValues = Object.values(counts).sort((a, b) => b - a);

    if (isStraight && isFlush) return sortedRanks[0] === 10 ? 'Royal Flush' : 'Straight Flush';
    if (countValues[0] === 5) return 'Five of a Kind';
    if (countValues[0] === 4) return 'Four of a Kind';
    if (countValues[0] === 3 && countValues[1] === 2) return 'Full House';
    if (isFlush) return 'Flush';
    if (isStraight) return 'Straight';
    if (countValues[0] === 3) return 'Three of a Kind';
    if (countValues[0] === 2 && countValues[1] === 2) return 'Two Pair';
    if (countValues[0] === 2) return 'Pair';

    return 'High Card';
};

export const GET_HAND_STATS = (hand: PokerHand, level: number): [number, number] => {
    const baseStats: Record<PokerHand, [number, number]> = {
        'High Card': [5, 1],
        'Pair': [10, 2],
        'Two Pair': [20, 2],
        'Three of a Kind': [30, 3],
        'Straight': [30, 4],
        'Flush': [35, 4],
        'Full House': [40, 4],
        'Four of a Kind': [60, 7],
        'Five of a Kind': [120, 12],
        'Straight Flush': [100, 8],
        'Royal Flush': [100, 8],
    };

    const [baseChips, baseMult] = baseStats[hand];
    const scale: Record<PokerHand, [number, number]> = {
        'High Card': [10, 1],
        'Pair': [15, 1],
        'Two Pair': [20, 1],
        'Three of a Kind': [20, 2],
        'Straight': [30, 2],
        'Flush': [15, 2],
        'Full House': [25, 2],
        'Four of a Kind': [30, 3],
        'Five of a Kind': [35, 3],
        'Straight Flush': [40, 3],
        'Royal Flush': [40, 3],
    };

    const [chipScale, multScale] = scale[hand];
    return [baseChips + (level - 1) * chipScale, baseMult + (level - 1) * multScale];
};

export const CALCULATE_CARD_CHIPS = (card: CardData): number => {
    let chips = 0;
    const rankVal = card.rank === 'A' ? 11 : (['K', 'Q', 'J', '10'].includes(card.rank) ? 10 : parseInt(card.rank));

    if (card.enhancement === Enhancement.Stone) return 50;

    chips += rankVal;
    if (card.enhancement === Enhancement.Bonus) chips += 30;
    if (card.edition === Edition.Foil) chips += 50;

    return chips;
};

export const CALCULATE_CARD_MULT = (card: CardData): number => {
    let mult = 0;
    if (card.enhancement === Enhancement.Mult) mult += 4;
    if (card.edition === Edition.Holographic) mult += 10;
    return mult;
};

export const CALCULATE_CARD_X_MULT = (card: CardData): number => {
    let xMult = 1;
    if (card.edition === Edition.Polychrome) xMult *= 1.5;
    if (card.enhancement === Enhancement.Glass) xMult *= 2;
    if (card.enhancement === Enhancement.Steel) xMult *= 1.5;
    return xMult;
};

export const GENERATE_DECK = (): CardData[] => {
    const suits: Suit[] = ['HEARTS', 'SPADES', 'DIAMONDS', 'CLUBS'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck: CardData[] = [];

    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push({
                id: `${suit}-${rank}-${Math.random()}`,
                rank,
                suit,
                enhancement: Enhancement.None,
                edition: Edition.None,
                seal: Seal.None,
            });
        });
    });

    return SHUFFLE_ARRAY(deck);
};

export const SHUFFLE_ARRAY = <T,>(array: T[]): T[] => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

export const GET_BLIND_NAME = (year: number): string => {
    const names = ['Chi Gathering (聚气期)', 'Foundation (筑基期)', 'Golden Core (金丹期)', 'Nascent Soul (元婴期)', 'Spirit Severing (化神期)', 'Dao Seeking (入道期)', 'Immortal Ascent (升仙期)', 'Grand Arbitrator (终极大劫)'];
    return names[Math.min(year - 1, names.length - 1)];
};

export const GET_RANK_VALUE = (rank: string): number => {
    if (rank === 'A') return 14;
    if (rank === 'K') return 13;
    if (rank === 'Q') return 12;
    if (rank === 'J') return 11;
    return parseInt(rank);
};

export const SORT_CARDS_BY_RANK = (cards: CardData[]): CardData[] => {
    return [...cards].sort((a, b) => GET_RANK_VALUE(b.rank) - GET_RANK_VALUE(a.rank));
};

export const CALCULATE_GOAL = (ante: number, round: number): number => {
    // Base goals for Ante 1
    const ante1Goals = [300, 450, 600]; // Small, Big, Boss
    const baseGoal = ante1Goals[Math.min(round - 1, 2)];

    // Scale exponentially with Ante: Goal = Base * 1.5^(Ante-1)
    return Math.floor(baseGoal * Math.pow(1.5, ante - 1));
};

export const JOKER_POOL: Joker[] = [
    { id: 'j_joker', name: 'Art of Breath (吐纳术)', rarity: 'Common', level: 1, slot: 'Head', price: 4, effect: '+4 Tao', description: '基础修仙法门。' },
    { id: 'j_greedy', name: 'Diamond Finger (金刚指)', rarity: 'Common', level: 1, slot: 'Hand', price: 5, effect: 'Diamonds give +4 Tao', description: '方块牌提供额外道行。' },
    { id: 'j_lusty', name: 'Lotus Palm (红莲掌)', rarity: 'Common', level: 1, slot: 'Hand', price: 5, effect: 'Hearts give +4 Tao', description: '红桃牌提供额外道行。' },
    { id: 'j_wrathful', name: 'Dark Slasher (玄铁重剑)', rarity: 'Common', level: 1, slot: 'Hand', price: 5, effect: 'Spades give +4 Tao', description: '黑桃牌提供额外道行。' },
    { id: 'j_gluttonous', name: 'Emerald Staff (翠竹仗)', rarity: 'Common', level: 1, slot: 'Hand', price: 5, effect: 'Clubs give +4 Tao', description: '梅花牌提供额外道行。' },
    { id: 'j_blue_joker', name: 'Blue Sky Robe (青天法袍)', rarity: 'Uncommon', level: 1, slot: 'Body', price: 6, effect: '+2 Tao per card in deck', description: '根据牌组余量提供道行。' },
    { id: 'j_abstract', name: 'Seven-Star Ring (七星戒)', rarity: 'Common', level: 1, slot: 'Accessory', price: 4, effect: '+3 Tao per Artifact', description: '每装备一件法宝获得道行。' },
    { id: 'j_odd_todd', name: 'Unicorn Boots (麒麟靴)', rarity: 'Common', level: 1, slot: 'Leg', price: 5, effect: 'Odd cards give +30 Tao', description: '奇数点数牌提供加成。' },
    { id: 'j_even_steven', name: 'Dragon Boots (真龙靴)', rarity: 'Common', level: 1, slot: 'Leg', price: 5, effect: 'Even cards give +4 Tao', description: '偶数点数牌提供加成。' },
    { id: 'j_constellation', name: 'Celestial Pendant (星曜佩)', rarity: 'Uncommon', level: 1, slot: 'Accessory', price: 6, effect: 'Gain x0.1 Tao per Planet', description: '已消费行星牌提供全局道行。' },
    { id: 'j_stuntman', name: 'Heavenly Helmet (乾坤盔)', rarity: 'Rare', level: 1, slot: 'Head', price: 8, effect: '+250 Tao, -2 Hand Size', description: '巨大的道行加成。' },
    { id: 'j_supernova', name: 'Nine-Turn Pill (九转丹)', rarity: 'Uncommon', level: 1, slot: 'Accessory', price: 6, effect: '+Tao based on hand use', description: '根据出牌频率叠加道行。' },
];

export const GET_JOKER_STATS = (joker: Joker): { tao: number, mult: number, xMult: number } => {
    const stats = { tao: 0, mult: 0, xMult: 1 };
    const levelScale = joker.level;

    switch (joker.id) {
        case 'j_joker':
            stats.mult = 4 * levelScale;
            break;
        case 'j_greedy':
        case 'j_lusty':
        case 'j_wrathful':
        case 'j_gluttonous':
        case 'j_even_steven':
            stats.mult = 4 * levelScale;
            break;
        case 'j_blue_joker':
            stats.tao = 2 * levelScale;
            break;
        case 'j_abstract':
            stats.mult = 3 * levelScale;
            break;
        case 'j_odd_todd':
            stats.tao = 30 * levelScale;
            break;
        case 'j_constellation':
            stats.xMult = 0.1 * levelScale; // Added per planet
            break;
        case 'j_stuntman':
            stats.tao = 250 * levelScale;
            break;
        case 'j_supernova':
            stats.mult = 1 * levelScale; // Multiplied by hand play count
            break;
    }
    return stats;
};

export const GET_JOKER_EFFECT_DISPLAY = (joker: Joker): string => {
    const stats = GET_JOKER_STATS(joker);
    if (joker.id === 'j_constellation') return `x${(1 + stats.xMult).toFixed(1)} Tao / Planet`;
    if (joker.id === 'j_abstract') return `+${stats.mult} Tao / Artifact`;
    if (joker.id === 'j_odd_todd') return `+${stats.tao} Tao (Odd)`;
    if (joker.id === 'j_even_steven') return `+${stats.mult} Tao (Even)`;
    if (joker.id === 'j_blue_joker') return `+${stats.tao} Tao / Card`;
    if (joker.id === 'j_stuntman') return `+${stats.tao} Tao`;
    if (joker.id === 'j_supernova') return `+${stats.mult} Tao / Year Play`;

    if (stats.mult > 0) return `+${stats.mult} Tao`;
    if (stats.tao > 0) return `+${stats.tao} Tao`;
    if (stats.xMult > 1) return `x${stats.xMult} Tao`;
    return joker.effect;
};

export const CONSUMABLE_POOL: Consumable[] = [
    // Elixirs (Previously Planets)
    { id: 'c_pluto', name: 'Pluto Elixir (冥王丹)', type: 'Planet', price: 3, effect: 'Level up High Card', description: '提升高牌等级。' },
    { id: 'c_mercury', name: 'Mercury Elixir (水星丹)', type: 'Planet', price: 3, effect: 'Level up Pair', description: '提升对子等级。' },
    { id: 'c_uranus', name: 'Uranus Elixir (天王丹)', type: 'Planet', price: 3, effect: 'Level up Two Pair', description: '提升两对等级。' },
    { id: 'c_venus', name: 'Venus Elixir (金星丹)', type: 'Planet', price: 3, effect: 'Level up Three of a Kind', description: '提升三条等级。' },
    { id: 'c_saturn', name: 'Saturn Elixir (土星丹)', type: 'Planet', price: 3, effect: 'Level up Straight', description: '提升顺子等级。' },
    { id: 'c_jupiter', name: 'Jupiter Elixir (木星丹)', type: 'Planet', price: 3, effect: 'Level up Flush', description: '提升同花等级。' },
    { id: 'c_mars', name: 'Mars Elixir (火星丹)', type: 'Planet', price: 3, effect: 'Level up Four of a Kind', description: '提升四条等级。' },
    { id: 'c_neptune', name: 'Neptune Elixir (海王丹)', type: 'Planet', price: 3, effect: 'Level up Straight Flush', description: '提升同花顺等级。' },

    // Mental Methods / Scrolls (Previously Tarot)
    { id: 'c_the_fool', name: 'Great Dream (大梦谁先觉)', type: 'Tarot', price: 3, effect: 'Reroll Boss', description: '重新随机当前劫难（首领）。' },
    { id: 'c_the_magician', name: 'Sun-Moon Swap (偷天换日法)', type: 'Tarot', price: 3, effect: 'Enhance 1 card to Wild', description: '将 1 张手牌变为万能牌（Wild）。' },
    { id: 'c_the_empress', name: 'Mult Avatar (多重影分身)', type: 'Tarot', price: 3, effect: 'Enhance 2 cards to Mult', description: '将 2 张手牌变为倍率增强牌。' },
    { id: 'c_the_hierophant', name: 'Tendon Change (易筋洗髓经)', type: 'Tarot', price: 3, effect: 'Enhance 2 cards to Bonus', description: '将 2 张手牌变为奖励筹码牌。' },
    { id: 'c_the_chariot', name: 'Diamond Body (金刚不坏身)', type: 'Tarot', price: 3, effect: 'Enhance 1 card to Steel', description: '将 1 张手牌变为钢制牌（Steel）。' },
    { id: 'c_the_devil', name: 'Demon Dissolution (天魔解体)', type: 'Tarot', price: 3, effect: 'Enhance 1 card to Glass', description: '将 1 张手牌变为玻璃牌（Glass）。' },
    { id: 'c_the_tower', name: 'Immovable King (不动明王)', type: 'Tarot', price: 3, effect: 'Enhance 1 card to Stone', description: '将 1 张手牌变为石头牌（Stone）。' },
    { id: 'c_the_temperance', name: 'Spirit Toad (聚宝金蟾)', type: 'Tarot', price: 3, effect: 'Double Spirit Stones (Max +20)', description: '灵石翻倍（最高额外+20）。' },
    { id: 'c_the_hanged_man', name: 'Slaying Three Corpses (斩三尸)', type: 'Tarot', price: 3, effect: 'Destroy 2 cards', description: '摧毁选中的最多 2 张牌。' },
    { id: 'c_death', name: 'Nirvana Finger (寂灭指)', type: 'Tarot', price: 3, effect: 'Clone Left to Right', description: '将左侧卡牌复制到右侧。' },
    { id: 'c_the_hermit', name: 'Celestial Omen (天机推演)', type: 'Tarot', price: 3, effect: 'Create 2 Elixirs', description: '随机获得 2 颗丹药。' },
    { id: 'c_the_high_priestess', name: 'External Avatar (身外化身)', type: 'Tarot', price: 2, effect: 'Create 2 Scrolls', description: '随机获得 2 卷锦囊。' },
    { id: 'c_the_emperor', name: 'Point to Gold (点石成金)', type: 'Tarot', price: 3, effect: 'Enhance 1 card to Gold', description: '将 1 张手牌变为黄金牌。' },
    { id: 'c_the_world', name: 'Four Symbols: Spades (四象阵：玄武)', type: 'Tarot', price: 3, effect: 'Change 3 cards to Spades', description: '将 3 张手牌变为黑桃。' },
    { id: 'c_the_sun', name: 'Four Symbols: Hearts (四象阵：朱雀)', type: 'Tarot', price: 3, effect: 'Change 3 cards to Hearts', description: '将 3 张手牌变为红桃。' },
    { id: 'c_the_star', name: 'Four Symbols: Diamonds (四象阵：白虎)', type: 'Tarot', price: 3, effect: 'Change 3 cards to Diamonds', description: '将 3 张手牌变为方块。' },
    { id: 'c_the_moon', name: 'Four Symbols: Clubs (四象阵：青龙)', type: 'Tarot', price: 3, effect: 'Change 3 cards to Clubs', description: '将 3 张手牌变为梅花。' },
];

export const GENERATE_SHOP_ITEMS = (): { jokers: Joker[], consumables: Consumable[] } => {
    const shuffledJokers = SHUFFLE_ARRAY(JOKER_POOL);
    const shuffledConsumables = SHUFFLE_ARRAY(CONSUMABLE_POOL);

    return {
        jokers: shuffledJokers.slice(0, 2),
        consumables: shuffledConsumables.slice(0, 2)
    };
};
