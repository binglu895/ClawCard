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
    const isFlush = Object.keys(suits).length === 1 && cards.length === 5;
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
    if (card.edition === Edition.Foil) chips += 50;

    return chips;
};

export const CALCULATE_CARD_MULT = (card: CardData): number => {
    let mult = 0;
    if (card.edition === Edition.Holographic) mult += 10;
    return mult;
};

export const CALCULATE_CARD_X_MULT = (card: CardData): number => {
    let xMult = 1;
    if (card.edition === Edition.Polychrome) xMult *= 1.5;
    if (card.enhancement === Enhancement.Glass) xMult *= 2;
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
    { id: 'j_joker', name: 'Joker (小丑)', rarity: 'Common', level: 1, price: 4, effect: '+4 Mult', description: '提供倍率加成。' },
    { id: 'j_greedy', name: 'Greedy Joker (贪婪小丑)', rarity: 'Common', level: 1, price: 5, effect: 'Diamonds give +4 Mult', description: '方块牌提供倍率加成。' },
    { id: 'j_lusty', name: 'Lusty Joker (好色小丑)', rarity: 'Common', level: 1, price: 5, effect: 'Hearts give +4 Mult', description: '红桃牌提供倍率加成。' },
    { id: 'j_wrathful', name: 'Wrathful Joker (愤怒小丑)', rarity: 'Common', level: 1, price: 5, effect: 'Spades give +4 Mult', description: '黑桃牌提供倍率加成。' },
    { id: 'j_gluttonous', name: 'Gluttonous Joker (贪食小丑)', rarity: 'Common', level: 1, price: 5, effect: 'Clubs give +4 Mult', description: '梅花牌提供倍率加成。' },
    { id: 'j_blue_joker', name: 'Blue Joker (蓝色小丑)', rarity: 'Uncommon', level: 1, price: 6, effect: '+2 Chips for each card in deck', description: '根据牌组剩余牌量提供筹码。' },
];

export const GET_JOKER_STATS = (joker: Joker): { chips: number, mult: number, xMult: number } => {
    const stats = { chips: 0, mult: 0, xMult: 1 };
    const levelScale = joker.level;

    switch (joker.id) {
        case 'j_joker':
            stats.mult = 4 * levelScale;
            break;
        case 'j_greedy':
        case 'j_lusty':
        case 'j_wrathful':
        case 'j_gluttonous':
            stats.mult = 4 * levelScale;
            break;
        case 'j_blue_joker':
            stats.chips = 2 * levelScale;
            break;
    }
    return stats;
};

export const GET_JOKER_EFFECT_DISPLAY = (joker: Joker): string => {
    const stats = GET_JOKER_STATS(joker);
    if (stats.mult > 0) return `+${stats.mult} Mult`;
    if (stats.chips > 0) {
        if (joker.id === 'j_blue_joker') return `+${stats.chips} Chips per card`;
        return `+${stats.chips} Chips`;
    }
    if (stats.xMult > 1) return `x${stats.xMult} Mult`;
    return joker.effect;
};

export const CONSUMABLE_POOL: Consumable[] = [
    { id: 'c_jupiter', name: 'Jupiter (木星)', type: 'Planet', price: 3, effect: 'Level up Flush', description: '提升同花等级。' },
    { id: 'c_mars', name: 'Mars (火星)', type: 'Planet', price: 3, effect: 'Level up Four of a Kind', description: '提升四条等级。' },
    { id: 'c_the_fool', name: 'The Fool (愚者)', type: 'Tarot', price: 3, effect: 'Create last Tarot/Planet', description: '创建最后使用的塔罗牌或行星牌。' },
    { id: 'c_the_magician', name: 'The Magician (魔术师)', type: 'Tarot', price: 3, effect: 'Enhance 2 cards to Lucky', description: '将 2 张牌增强为幸运牌。' },
];

export const GENERATE_SHOP_ITEMS = (): { jokers: Joker[], consumables: Consumable[] } => {
    const shuffledJokers = SHUFFLE_ARRAY(JOKER_POOL);
    const shuffledConsumables = SHUFFLE_ARRAY(CONSUMABLE_POOL);

    return {
        jokers: shuffledJokers.slice(0, 2),
        consumables: shuffledConsumables.slice(0, 2)
    };
};
