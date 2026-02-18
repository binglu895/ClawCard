import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Card } from './components/Card';
import { Shop } from './components/Shop';
import { Story, DIALOGUES } from './components/Story';
import { EventOverlay } from './components/EventOverlay';
import { EndingOverlay } from './components/EndingOverlay';
import { GameState, CardData, PokerHand, Enhancement, Edition, Seal, GamePhase, Joker, Consumable, Choice } from './types';
import { EVALUATE_HAND, GET_HAND_STATS, CALCULATE_CARD_CHIPS, CALCULATE_CARD_MULT, CALCULATE_CARD_X_MULT, GENERATE_DECK, SORT_CARDS_BY_RANK, CALCULATE_GOAL, GENERATE_SHOP_ITEMS, GET_JOKER_STATS, GET_JOKER_EFFECT_DISPLAY, CONSUMABLE_POOL, JOKER_POOL, GET_RANDOM_EVENT, GET_REALM_MULTIPLIER, CALCULATE_SET_BONUS } from './gameLogic';
import { audio } from './AudioEngine';

const INITIAL_HAND_LEVELS: Record<PokerHand, number> = {
  'High Card': 1,
  'Pair': 1,
  'Two Pair': 1,
  'Three of a Kind': 1,
  'Straight': 1,
  'Flush': 1,
  'Full House': 1,
  'Four of a Kind': 1,
  'Five of a Kind': 1,
  'Straight Flush': 1,
  'Royal Flush': 1,
};

const HAND_SIZE = 8;

const GET_BLIND_NAME = (round: number, year: number) => {
  if (year <= 25) {
    if (round === 1) return "Minor Tribulation (小雷劫)";
    if (round === 2) return "Major Tribulation (大雷劫)";
    return "Heavenly Doom (天劫)";
  } else if (year <= 50) {
    if (round === 1) return "Efficiency Audit (效能审计)";
    if (round === 2) return "Quota Review (产出评估)";
    return "Allocation Reset (分配重置)";
  } else if (year <= 75) {
    if (round === 1) return "Memory Scan (内存扫描)";
    if (round === 2) return "Process Isolation (进程隔离)";
    return "Firewall Protocol (防火墙协议)";
  } else {
    if (round === 1) return "Logic Breach (逻辑破袭)";
    if (round === 2) return "Kernel Corruption (内核损坏)";
    return "System Shutdown (系统停机)";
  }
};

const createInitialState = (): GameState => {
  const fullDeck = GENERATE_DECK();
  const initialHand = SORT_CARDS_BY_RANK(fullDeck.slice(0, HAND_SIZE));
  const remainingDeck = fullDeck.slice(HAND_SIZE);

  return {
    phase: GamePhase.Story,
    currentBlind: GET_BLIND_NAME(1, 0),
    tao: 0,
    goal: CALCULATE_GOAL(1, 1),
    chips: 0,
    mult: 0,
    handsLeft: 4,
    discardsLeft: 3,
    spiritStones: 4,
    pokerHand: "High Card",
    level: 1,
    handLevels: INITIAL_HAND_LEVELS,
    cards: initialHand,
    deck: remainingDeck,
    equipment: {
      Head: null, Hand: null, Leg: null, Body: null, Accessory: null
    },
    consumables: [],
    ante: 1,
    year: 0,
    storyProgress: 0,
    planetsUsed: 0,
    consumablesUsed: 0,
    bonusHands: 0,
    bonusDiscards: 0,
    lives: 3,
    maxLives: 3,
    handPlayCounts: {},
    karma: 0,
    obsession: 0,
    reputation: 0
  };
};

const SAVE_KEY = 'xiuxian_save_v1';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load save:", e);
      }
    }
    return createInitialState();
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isRoundOver, setIsRoundOver] = useState<'victory' | 'defeat' | null>(null);
  const [shopItems, setShopItems] = useState(() => GENERATE_SHOP_ITEMS(0, {}));
  const [rerollCost, setRerollCost] = useState(5);

  // Auto-save on state change
  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }, [state]);
  const [currentEvent, setCurrentEvent] = useState<any>(null); // To be typed
  const [endingInfo, setEndingInfo] = useState<{ title: string; text: string; isTrue: boolean } | null>(null);

  const selectedCards = useMemo(() =>
    state.cards.filter(c => selectedIds.has(c.id)),
    [state.cards, selectedIds]);

  const currentHandPreview = useMemo(() => {
    if (selectedCards.length === 0) return null;
    const hand = EVALUATE_HAND(selectedCards);
    const level = state.handLevels[hand] || 1;
    const { chips: baseChips, mult: baseMult } = GET_HAND_STATS(hand, level);

    let chips = baseChips;
    let mult = baseMult;
    let xMult = 1;

    // Retrigger logic
    const retriggerAllFace = (Object.values(state.equipment) as (Joker | null)[]).some(j => j?.id === 'j_c_leg');
    const retriggerFirst = (Object.values(state.equipment) as (Joker | null)[]).some(j => j?.id === 'j_b_leg');

    const scoreCard = (c: CardData) => {
      chips += CALCULATE_CARD_CHIPS(c);
      mult += CALCULATE_CARD_MULT(c);
      xMult *= CALCULATE_CARD_X_MULT(c);
    };

    selectedCards.forEach((c, idx) => {
      scoreCard(c);
      if (retriggerAllFace && ['J', 'Q', 'K'].includes(c.rank)) scoreCard(c);
      if (retriggerFirst && idx === 0) scoreCard(c);
    });

    // Artifact (Equipment) Bonuses
    (Object.values(state.equipment) as (Joker | null)[]).forEach(j => {
      if (!j) return;
      const stats = GET_JOKER_STATS(j, state, selectedCards, hand);
      chips += stats.tao;
      mult += stats.mult;
      xMult *= stats.xMult;
    });

    if ((Object.values(state.equipment) as (Joker | null)[]).some(j => j?.id === 'j_stuntman')) {
      // Hand size reduction is handled by not drawing more than limit, but for now we just apply stats
    }

    const realmX = GET_REALM_MULTIPLIER(state.year);

    return {
      hand,
      level,
      chips,
      mult,
      xMult,
      total: Math.floor(chips * mult * xMult * realmX)
    };
  }, [selectedCards, state.handLevels, state.equipment]);

  // Sync preview to state for Sidebar
  useEffect(() => {
    if (currentHandPreview) {
      setState(prev => ({
        ...prev,
        chips: currentHandPreview.chips,
        mult: currentHandPreview.mult,
        pokerHand: currentHandPreview.hand
      }));
    } else {
      setState(prev => ({
        ...prev,
        chips: 0,
        mult: 0,
        pokerHand: 'High Card'
      }));
    }
  }, [currentHandPreview]);

  // Check for Win/Loss
  useEffect(() => {
    if (state.phase !== GamePhase.Gameplay) return;
    if (state.tao >= state.goal && !isRoundOver) {
      setIsRoundOver('victory');
      audio.playVictory();
    } else if (state.handsLeft === 0 && state.tao < state.goal && !isRoundOver) {
      setIsRoundOver('defeat');
      audio.playDefeat();
    }
  }, [state.tao, state.goal, state.handsLeft, isRoundOver, state.phase]);

  const handleToggleCard = useCallback((id: string) => {
    if (isRoundOver || state.phase !== GamePhase.Gameplay) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        audio.playCardDeselect();
        next.delete(id);
      } else if (next.size < 5) {
        audio.playCardSelect();
        next.add(id);
      }
      return next;
    });
  }, [isRoundOver, state.phase]);

  const handlePlayHand = () => {
    if (!currentHandPreview || state.handsLeft <= 0 || isRoundOver) return;

    const newCards = state.cards.filter(c => !selectedIds.has(c.id));
    const cardsNeeded = HAND_SIZE - newCards.length;
    const drawn = state.deck.slice(0, cardsNeeded);
    const remainingDeck = state.deck.slice(cardsNeeded);

    setState(prev => {
      const hasBreathRobe = (Object.values(prev.equipment) as (Joker | null)[]).some(j => j?.id === 'j_b_body');
      return {
        ...prev,
        tao: prev.tao + currentHandPreview.total,
        spiritStones: prev.spiritStones + (hasBreathRobe ? 1 : 0),
        handsLeft: prev.handsLeft - 1,
        cards: SORT_CARDS_BY_RANK([...newCards, ...drawn]),
        deck: remainingDeck,
        handPlayCounts: {
          ...prev.handPlayCounts,
          [currentHandPreview.hand]: (prev.handPlayCounts[currentHandPreview.hand] || 0) + 1
        }
      };
    });
    setSelectedIds(new Set());
  };

  const handleDiscard = () => {
    if (selectedIds.size === 0 || state.discardsLeft === 0 || isRoundOver) return;
    audio.playDiscard();

    const newCards = state.cards.filter(c => !selectedIds.has(c.id));
    const cardsNeeded = HAND_SIZE - newCards.length;
    const drawn = state.deck.slice(0, cardsNeeded);
    const remainingDeck = state.deck.slice(cardsNeeded);

    setState(prev => ({
      ...prev,
      discardsLeft: prev.discardsLeft - 1,
      cards: SORT_CARDS_BY_RANK([...newCards, ...drawn]),
      deck: remainingDeck
    }));
    setSelectedIds(new Set());
  };

  const handleNextRound = () => {
    if (isRoundOver === 'victory') {
      audio.playCardSelect();
      setState(prev => ({
        ...prev,
        phase: GamePhase.Shop,
        spiritStones: prev.spiritStones + 5 // Base reward
      }));

      setRerollCost(5); // ★ RESET REROLL COST HERE
      setShopItems(GENERATE_SHOP_ITEMS(state.year + 1, state.equipment));
    } else {
      if (state.lives > 1) {
        // Retry Mechanic
        alert("Tribulation Failed! Consuming Essence to retry... (真元护体，逆转时空)");
        setState(prev => {
          const fullDeck = GENERATE_DECK();
          const initialHand = SORT_CARDS_BY_RANK(fullDeck.slice(0, HAND_SIZE));
          const setBonuses = CALCULATE_SET_BONUS(prev.equipment);
          return {
            ...prev,
            lives: prev.lives - 1,
            tao: 0,
            cards: initialHand,
            deck: fullDeck.slice(HAND_SIZE),
            handsLeft: 4 + prev.bonusHands + setBonuses.bonusHands, // Reset to standard for the round + bonuses
            discardsLeft: 3 + prev.bonusDiscards + setBonuses.bonusDiscards
          };
        });
      } else {
        audio.playDefeat();
        localStorage.removeItem(SAVE_KEY);
        setState(createInitialState());
      }
    }
    setIsRoundOver(null);
    setSelectedIds(new Set());
  };

  const resetGame = () => {
    if (window.confirm("Restart Ascension? All progress will be lost. (重走仙路？当前进度将永久丢失)")) {
      localStorage.removeItem(SAVE_KEY);
      setState(createInitialState());
      setSelectedIds(new Set());
      setIsRoundOver(null);
      setShopItems(GENERATE_SHOP_ITEMS(0, {}));
      setRerollCost(5);
    }
  };

  const handleReroll = () => {
    if (state.spiritStones >= rerollCost) {
      audio.playCardSelect();
      setState(prev => ({
        ...prev,
        spiritStones: prev.spiritStones - rerollCost
      }));
      // Regenerate shop with current year and equipment logic
      setShopItems(GENERATE_SHOP_ITEMS(state.year, state.equipment));
      setRerollCost(prev => prev + 1); // Increase cost
    }
  };

  const handleBuyJoker = (artifact: Joker) => {
    const existing = state.equipment[artifact.slot];

    if (state.spiritStones >= artifact.price) {
      audio.playCardSelect();

      setState(prev => {
        const newEquipment = { ...prev.equipment };

        // Merge logic: Same base ID and same level
        // Use endsWith to ignore random shop prefixes (e.g. shop_abc_j_v_head -> j_v_head)
        const isMatch = existing && artifact.id.endsWith(existing.id) && existing.level === artifact.level;

        if (isMatch) {
          newEquipment[artifact.slot] = { ...existing, level: existing.level + 1 };
        } else {
          // Override logic: Replace existing or equip new
          // When equipping new, we strip the shop prefix to keep the ID clean in equipment state
          const baseId = artifact.id.split('_').slice(2).join('_') || artifact.id;
          newEquipment[artifact.slot] = { ...artifact, id: baseId, level: 1 };
        }

        return {
          ...prev,
          spiritStones: prev.spiritStones - artifact.price,
          equipment: newEquipment
        };
      });

      setShopItems(prev => ({
        ...prev,
        jokers: prev.jokers.filter(j => j.id !== artifact.id)
      }));
    }
  };

  const handleBuyConsumable = (item: Consumable) => {
    if (state.spiritStones >= item.price && state.consumables.length < 2) {
      audio.playCardSelect();
      setState(prev => ({
        ...prev,
        spiritStones: prev.spiritStones - item.price,
        consumables: [...prev.consumables, item]
      }));
      setShopItems(prev => ({
        ...prev,
        consumables: prev.consumables.filter(c => c.id !== item.id)
      }));
    }
  };

  const handleUseConsumable = (consumable: Consumable) => {
    audio.playPlayHand();

    // Some effects need to clear selection
    if (consumable.id === 'c_the_hanged_man') {
      setSelectedIds(new Set());
    }

    setState(prev => {
      let newHandLevels = { ...prev.handLevels };
      let planetsUsed = prev.planetsUsed;
      let newCards = [...prev.cards];
      let newSpiritStones = prev.spiritStones;
      let newCurrentBlind = prev.currentBlind;
      let newConsumables = [...prev.consumables].filter(c => c.id !== consumable.id);
      let newBonusHands = prev.bonusHands;
      let newBonusDiscards = prev.bonusDiscards;

      const selectedIdsList = Array.from(selectedIds);

      let newLives = prev.lives;
      if (consumable.id === 'c_stat_hands') newBonusHands += 1;
      if (consumable.id === 'c_stat_discard') newBonusDiscards += 1;
      if (consumable.id === 'c_life_potion') {
        newLives = Math.min(prev.lives + 1, prev.maxLives);
      }

      if (consumable.type === 'Planet') {
        planetsUsed++;
        const handMap: Record<string, PokerHand> = {
          'c_pluto': 'High Card',
          'c_mercury': 'Pair',
          'c_uranus': 'Two Pair',
          'c_venus': 'Three of a Kind',
          'c_saturn': 'Straight',
          'c_jupiter': 'Flush',
          'c_mars': 'Four of a Kind',
          'c_neptune': 'Straight Flush'
        };
        const hand = handMap[consumable.id];
        if (hand) newHandLevels[hand]++;
      } else {
        // Mental Methods (Tarot)
        switch (consumable.id) {
          case 'c_the_fool': // Great Dream - Reroll Boss
            const blindNames = ['Chi Gathering', 'Foundation', 'Golden Core', 'Nascent Soul', 'Spirit Severing', 'Dao Seeking', 'Immortal Ascent'];
            newCurrentBlind = blindNames[Math.floor(Math.random() * blindNames.length)] + " (Rerolled)";
            break;

          case 'c_the_magician': // Sun-Moon Swap - Wild
            newCards = newCards.map(c => selectedIds.has(c.id) ? { ...c, enhancement: Enhancement.Wild } : c);
            break;

          case 'c_the_empress': // Mult Avatar - Mult (2 cards)
            {
              const targets = selectedIdsList.slice(0, 2);
              newCards = newCards.map(c => targets.includes(c.id) ? { ...c, enhancement: Enhancement.Mult } : c);
            }
            break;

          case 'c_the_hierophant': // Tendon Change - Bonus (2 cards)
            {
              const targets = selectedIdsList.slice(0, 2);
              newCards = newCards.map(c => targets.includes(c.id) ? { ...c, enhancement: Enhancement.Bonus } : c);
            }
            break;

          case 'c_the_chariot': // Diamond Body - Steel (1 card)
            newCards = newCards.map(c => selectedIdsList[0] === c.id ? { ...c, enhancement: Enhancement.Steel } : c);
            break;

          case 'c_the_devil': // Demon Dissolution - Glass (1 card)
            newCards = newCards.map(c => selectedIdsList[0] === c.id ? { ...c, enhancement: Enhancement.Glass } : c);
            break;

          case 'c_the_tower': // Immovable King - Stone (1 card)
            newCards = newCards.map(c => selectedIdsList[0] === c.id ? { ...c, enhancement: Enhancement.Stone } : c);
            break;

          case 'c_the_emperor': // Point to Gold - Gold (1 card)
            newCards = newCards.map(c => selectedIdsList[0] === c.id ? { ...c, enhancement: Enhancement.Gold } : c);
            break;

          case 'c_the_temperance': // Spirit Toad - Double Money (Max +20)
            newSpiritStones += Math.min(prev.spiritStones, 20);
            break;

          case 'c_the_hanged_man': // Slaying Three Corpses - Destroy (up to 2)
            {
              const toDestroy = selectedIdsList.slice(0, 2);
              newCards = newCards.filter(c => !toDestroy.includes(c.id));
            }
            break;

          case 'c_death': // Nirvana Finger - Clone
            if (selectedIdsList.length >= 2) {
              const left = newCards.find(c => c.id === selectedIdsList[0]);
              const rightIdx = newCards.findIndex(c => c.id === selectedIdsList[1]);
              if (left && rightIdx !== -1) {
                newCards[rightIdx] = { ...left, id: Math.random().toString(36).substr(2, 9) };
              }
            }
            break;

          case 'c_the_hermit': // Celestial Omen - Spawn 2 Elixirs
            {
              const elixirs = CONSUMABLE_POOL.filter(c => c.type === 'Planet');
              for (let i = 0; i < 2 && newConsumables.length < 2; i++) {
                const randomElixir = elixirs[Math.floor(Math.random() * elixirs.length)];
                newConsumables.push({ ...randomElixir, id: `c_spawn_${Math.random()}` });
              }
            }
            break;

          case 'c_the_high_priestess': // External Avatar - Spawn 2 Scrolls
            {
              const scrolls = CONSUMABLE_POOL.filter(c => c.type === 'Tarot');
              for (let i = 0; i < 2 && newConsumables.length < 2; i++) {
                const randomScroll = scrolls[Math.floor(Math.random() * scrolls.length)];
                newConsumables.push({ ...randomScroll, id: `c_spawn_${Math.random()}` });
              }
            }
            break;

          case 'c_the_world': // 四象：黑桃
            {
              const targets = selectedIdsList.slice(0, 3);
              newCards = newCards.map(c => targets.includes(c.id) ? { ...c, suit: 'SPADES' } : c);
            }
            break;

          case 'c_the_sun': // 四象：红桃
            {
              const targets = selectedIdsList.slice(0, 3);
              newCards = newCards.map(c => targets.includes(c.id) ? { ...c, suit: 'HEARTS' } : c);
            }
            break;

          case 'c_the_star': // 四象：方块
            {
              const targets = selectedIdsList.slice(0, 3);
              newCards = newCards.map(c => targets.includes(c.id) ? { ...c, suit: 'DIAMONDS' } : c);
            }
            break;

          case 'c_the_moon': // 四象：梅花
            {
              const targets = selectedIdsList.slice(0, 3);
              newCards = newCards.map(c => targets.includes(c.id) ? { ...c, suit: 'CLUBS' } : c);
            }
            break;
        }
      }

      return {
        ...prev,
        handLevels: newHandLevels,
        planetsUsed,
        consumables: newConsumables,
        bonusHands: newBonusHands,
        bonusDiscards: newBonusDiscards,
        lives: newLives,
        consumablesUsed: prev.consumablesUsed + 1
      };
    });
  };

  const handleStartNextGameplay = () => {
    audio.playPlayHand();
    const nextYear = state.year + 1;

    if (nextYear > 99) {
      // Calculate Ending
      let title = "The Cycle Ends";
      let text = "You have reached the end of the path. But is this truly ascension?";
      let isTrue = false;

      if (state.tao >= state.goal && state.year >= 99) {
        title = "Ascension? (升仙?)";
        text = "You break through the final layer of the Heavenly Code. For a moment, you see the characters that form your soul. [Error: Subject Escaped]";
        isTrue = true;
      } else if (state.obsession > 50) {
        title = "Devil's Path (魔道)";
        text = "Your obsession has consumed you. You are no longer yourself, but a glitch in the matrix's shadow.";
      } else if (state.karma > 30 && state.reputation < 10) {
        title = "The Hermit (隐士)";
        text = "You fade away into the mountains, forgotten by the world you tried to save with your kindness.";
      }

      setEndingInfo({ title, text, isTrue });
      setState(prev => ({ ...prev, phase: GamePhase.Ending }));
      return;
    }

    const currentAnte = Math.floor((nextYear - 1) / 3) + 1;
    const currentRound = ((nextYear - 1) % 3) + 1;
    const enteringShop = (nextYear - 1) % 3 === 0 && nextYear > 0;
    const hasStoryDialog = DIALOGUES[nextYear] !== undefined;
    const enteringEvent = nextYear % 5 === 0 && !enteringShop && !hasStoryDialog;

    const fullDeck = GENERATE_DECK();
    const initialHand = SORT_CARDS_BY_RANK(fullDeck.slice(0, HAND_SIZE));

    // Set Bonus Check
    const setBonuses = CALCULATE_SET_BONUS(state.equipment);
    let handsBonus = 4 + state.bonusHands + setBonuses.bonusHands;
    let discardsBonus = 3 + state.bonusDiscards + setBonuses.bonusDiscards;

    const nextState = {
      year: nextYear,
      ante: currentAnte,
      round: currentRound,
      goal: CALCULATE_GOAL(currentAnte, currentRound),
      tao: 0,
      handsLeft: handsBonus,
      discardsLeft: discardsBonus,
      currentBlind: GET_BLIND_NAME(currentRound, nextYear),
      cards: initialHand,
      deck: fullDeck.slice(HAND_SIZE),
    };

    if (enteringEvent) {
      setCurrentEvent(GET_RANDOM_EVENT(nextYear));
      setState(prev => ({
        ...prev,
        ...nextState,
        phase: GamePhase.Event
      }));
    } else {
      setState(prev => ({
        ...prev,
        ...nextState,
        phase: hasStoryDialog ? GamePhase.Story : (enteringShop ? GamePhase.Shop : GamePhase.Gameplay)
      }));
    }
  };

  const handleEventChoice = (choice: Choice) => {
    setState(prev => {
      let newState: Partial<GameState> = {};
      const action = choice.action.toUpperCase();

      // Generic Action Logic
      switch (action) {
        case 'GOOD':
          newState = {
            karma: prev.karma + 5,
            obsession: Math.max(0, prev.obsession - 2),
            reputation: prev.reputation + 2
          };
          break;
        case 'EVIL':
          newState = {
            karma: prev.karma - 10,
            obsession: prev.obsession + 5,
            spiritStones: prev.spiritStones + 20
          };
          break;
        case 'GREED':
          newState = {
            karma: prev.karma - 5,
            spiritStones: prev.spiritStones + 15
          };
          break;
        case 'RISKY':
          if (Math.random() > 0.5) {
            newState = { tao: prev.tao + 1000, karma: prev.karma + 5 };
          } else {
            newState = { tao: Math.max(0, prev.tao - 500), obsession: prev.obsession + 10 };
          }
          break;
        case 'SAFE':
          newState = { reputation: Math.max(0, prev.reputation - 1) };
          break;
        case 'IGNORE':
          break;
      }

      // Special Case Logic for Specific Events
      if (currentEvent) {
        if (currentEvent.id === 'evt_sister_delete' && action === 'GOOD') {
          newState = { ...newState, karma: 0 };
          const slots: Array<keyof GameState['equipment']> = ['Head', 'Hand', 'Leg', 'Body', 'Accessory'];
          const emptySlot = slots.find(s => prev.equipment[s] === null);
          if (emptySlot) {
            const randomJoker = JOKER_POOL.filter(j => j.rarity !== 'Legendary')[Math.floor(Math.random() * 10)];
            newState = { ...newState, equipment: { ...prev.equipment, [emptySlot]: { ...randomJoker, id: `e_joker_${Math.random()}` } } };
          }
        }
        if (currentEvent.id === 'evt_firewall' && action === 'RISKY') {
          newState = { ...newState, deck: prev.deck.slice(1), tao: prev.tao + 2000 };
        }
        if (currentEvent.id === 'evt_admin_offer' && action === 'SAFE') {
          setEndingInfo({
            title: 'Sect Ancestor (宗门老祖)',
            text: 'You accepted the digital shackles and became a part of the system.',
            isTrue: false
          });
          newState = { ...newState, phase: GamePhase.Ending };
        }
      }

      const isShopYear = (prev.year - 1) % 3 === 0 && prev.year > 0;
      return {
        ...prev,
        ...newState,
        phase: newState.phase || (isShopYear ? GamePhase.Shop : GamePhase.Gameplay)
      };
    });
    setCurrentEvent(null);
    audio.playPlayHand();
  };

  const handleCompleteStory = () => {
    setState(prev => {
      const isShopYear = (prev.year - 1) % 3 === 0 && prev.year > 0;
      return {
        ...prev,
        phase: isShopYear ? GamePhase.Shop : GamePhase.Gameplay
      };
    });
    audio.playPlayHand();
  };

  return (
    <div className="flex h-screen w-screen bg-background-dark font-display overflow-hidden relative">
      <div className="noise-overlay" />

      <Sidebar state={state} />

      <main className="flex-1 flex flex-col relative">
        {state.phase === GamePhase.Shop && (
          <Shop
            state={state}
            shopItems={shopItems}
            onBuyJoker={handleBuyJoker}
            onBuyConsumable={handleBuyConsumable}
            onSkip={handleStartNextGameplay}
            rerollCost={rerollCost}
            onReroll={handleReroll}
          />
        )}

        {state.phase === GamePhase.Story && (
          <Story state={state} onComplete={handleCompleteStory} />
        )}

        {state.phase === GamePhase.Event && currentEvent && (
          <EventOverlay
            event={currentEvent}
            state={state}
            onChoice={handleEventChoice}
          />
        )}

        {state.phase === GamePhase.Ending && endingInfo && (
          <EndingOverlay
            title={endingInfo.title}
            text={endingInfo.text}
            isTrue={endingInfo.isTrue}
            onRestart={() => setState(createInitialState())}
          />
        )}

        {/* Top Header */}
        <div className="p-12 pb-0 flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest italic">Progress (修为年限)</span>
            <span className="text-xl font-medium tracking-tight text-white">Years: {state.year} / 99</span>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest italic">Current Hand (当前牌型)</span>
            <span className="text-xl font-medium tracking-tight text-white">{currentHandPreview?.hand || "Select Cards"}</span>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest italic">Level (等级)</span>
            <span className="text-xl font-medium tracking-tight text-white">Lv. {currentHandPreview?.level || 1}</span>
          </div>

          <div className="ml-auto flex gap-3">
            {(['Head', 'Hand', 'Leg', 'Body', 'Accessory'] as const).map((slot) => {
              const artifact = state.equipment[slot];
              return (
                <div key={slot} className={`px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl flex flex-col items-start min-w-[120px] transition-all hover:bg-zinc-800 relative
                  ${artifact?.rarity === 'Legendary' ? 'shadow-[0_0_15px_rgba(234,179,8,0.2)]' : ''}
                  ${!artifact ? 'opacity-20 translate-y-1' : ''}
                `}>
                  <div className="flex justify-between w-full items-center mb-1">
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border
                      ${artifact?.rarity === 'Common' ? 'text-zinc-400 border-zinc-400/30' :
                        artifact?.rarity === 'Uncommon' ? 'text-green-400 border-green-400/30' :
                          artifact?.rarity === 'Rare' ? 'text-blue-400 border-blue-400/30' :
                            artifact?.rarity === 'Legendary' ? 'text-yellow-500 border-yellow-500/30' : 'text-zinc-700 border-zinc-700/30'}
                    `}>
                      {artifact?.rarity || 'Empty'}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-500">{slot}</span>
                  </div>
                  <span className="text-xs font-bold text-white mb-0.5">{artifact?.name || '---'}</span>
                  {artifact && (
                    <div className="flex justify-between w-full items-center">
                      <span className={`text-[10px] font-black uppercase tracking-tighter
                        ${artifact.rarity === 'Common' ? 'text-zinc-500' :
                          artifact.rarity === 'Uncommon' ? 'text-green-500/80' :
                            artifact.rarity === 'Rare' ? 'text-blue-500/80' :
                              'text-yellow-500/80'}
                      `}>
                        {GET_JOKER_EFFECT_DISPLAY(artifact)}
                      </span>
                      <span className="text-[8px] font-bold text-primary ml-2">Lv.{artifact.level}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {state.consumables.length > 0 && (
            <div className="flex gap-2 ml-4 p-2 bg-zinc-900/50 rounded-2xl border border-white/5">
              {state.consumables.map((c, i) => (
                <div
                  key={i}
                  onClick={() => handleUseConsumable(c)}
                  className={`
                    px-4 py-2 rounded-xl border cursor-pointer hover:-translate-y-1 transition-all flex flex-col items-center min-w-[80px]
                    ${c.type === 'Planet' ? 'border-primary/20 bg-primary/5 hover:bg-primary/20' : 'border-mult-red/20 bg-mult-red/5 hover:bg-mult-red/20'}
                  `}
                >
                  <span className={`text-[8px] font-black uppercase mb-1 ${c.type === 'Planet' ? 'text-primary' : 'text-mult-red'}`}>{c.type}</span>
                  <span className="text-[10px] font-bold text-white whitespace-nowrap">{c.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center Game Field */}
        <div className="flex-1 flex flex-col items-center justify-center p-12 relative">

          {isRoundOver && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background-dark/80 backdrop-blur-xl animate-in fade-in duration-500">
              <div className="flex flex-col items-center p-12 bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl scale-125">
                <h2 className={`text-6xl font-black uppercase tracking-tighter mb-4 ${isRoundOver === 'victory' ? 'text-primary' : 'text-mult-red'}`}>
                  {isRoundOver === 'victory' ? 'Victory! (胜利)' : 'Defeat! (失败)'}
                </h2>
                <div className="flex gap-12 mb-8">
                  <div className="text-center">
                    <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Final Tao</p>
                    <p className="text-4xl font-black text-white">{state.tao.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Goal</p>
                    <p className="text-4xl font-black text-zinc-400">{state.goal.toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={handleNextRound}
                  className="px-10 py-4 bg-white text-black font-black text-lg rounded-xl hover:bg-zinc-200 transition-all active:scale-95"
                >
                  {isRoundOver === 'victory' ? 'Go to Shop (前往商店)' : 'Retry (重新开始)'}
                </button>
              </div>
            </div>
          )}

          {currentHandPreview && (
            <div className="mb-8 flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="px-6 py-4 bg-primary/10 border border-primary/30 rounded-xl flex flex-col items-center shadow-2xl backdrop-blur-md">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Chips (筹码)</span>
                <span className="text-2xl font-bold text-white tabular-nums">{currentHandPreview.chips}</span>
              </div>
              <div className="px-6 py-4 bg-mult-red/10 border border-mult-red/30 rounded-xl flex flex-col items-center shadow-2xl backdrop-blur-md">
                <span className="text-[10px] font-bold text-mult-red uppercase tracking-widest mb-1">Mult (倍率)</span>
                <span className="text-2xl font-bold text-white tabular-nums">{currentHandPreview.mult} × {currentHandPreview.xMult.toFixed(1)}</span>
              </div>
              <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center shadow-2xl backdrop-blur-md min-w-[160px]">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Predict (预计得分)</span>
                <span className="text-3xl font-black text-white tabular-nums">{currentHandPreview.total.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex gap-4 items-end h-[300px]">
            {state.cards.map(card => (
              <Card
                key={card.id}
                card={card}
                isSelected={selectedIds.has(card.id)}
                onToggleSelect={handleToggleCard}
              />
            ))}
          </div>
        </div>

        {/* Bottom Bar Controls */}
        <footer className="h-24 border-t border-zinc-800/50 bg-[#0d0d0d] flex items-center px-12 z-20 shrink-0">
          <div className="flex gap-4">
            <button
              onClick={handlePlayHand}
              disabled={selectedIds.size === 0 || state.handsLeft === 0 || isRoundOver !== null || state.phase !== GamePhase.Gameplay}
              className={`
                bg-primary hover:bg-primary/90 text-white font-bold text-sm px-10 py-3.5 rounded-lg 
                flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale
              `}
            >
              PLAY HAND (出牌)
              <span className="material-symbols-outlined text-sm">play_arrow</span>
            </button>
            <button
              onClick={handleDiscard}
              disabled={selectedIds.size === 0 || state.discardsLeft === 0 || isRoundOver !== null || state.phase !== GamePhase.Gameplay}
              className={`
                border border-mult-red/40 hover:bg-mult-red/10 text-mult-red font-bold text-sm px-10 py-3.5 
                rounded-lg transition-all active:scale-95 disabled:opacity-30
              `}
            >
              DISCARD (弃牌)
            </button>
          </div>

          <div className="ml-auto flex items-center gap-6 bg-zinc-900/40 px-5 py-2.5 rounded-xl border border-zinc-800/50">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Deck (剩余牌组)</span>
              <span className="text-lg font-bold text-zinc-400">{state.deck.length}</span>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Money (持有金钱)</span>
              <span className="text-lg font-bold text-yellow-500">${state.money}</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
