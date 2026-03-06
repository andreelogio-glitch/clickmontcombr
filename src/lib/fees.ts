// Platform fee calculation
// Montador bids X → client pays X * 1.2 → montador receives X * 0.9 → platform keeps X * 0.3

export const PLATFORM_CLIENT_FEE = 0.15; // 15% service fee for the client
export const PLATFORM_MONTADOR_FEE = 0.10; // 10% ClickMont commission from montador

// Desmontagem split: montador gets 40% on disassembly confirmation, 60% on assembly confirmation
export const DESMONTAGEM_FIRST_SPLIT = 0.40;
export const DESMONTAGEM_SECOND_SPLIT = 0.60;

// Same-day completion bonus
export const SAME_DAY_BONUS = 0.10; // 10% bonus

export const calcClientTotal = (bidAmount: number): number => {
  return Math.round(bidAmount * (1 + PLATFORM_CLIENT_FEE) * 100) / 100;
};

export const calcMontadorReceives = (bidAmount: number, isUrgent: boolean = false): number => {
  // Urgent orders: no platform fee deduction (montador gets 100%)
  if (isUrgent) return Math.round(bidAmount * 100) / 100;
  return Math.round(bidAmount * (1 - PLATFORM_MONTADOR_FEE) * 100) / 100;
};

export const calcSameDayBonus = (montadorAmount: number): number => {
  return Math.round(montadorAmount * SAME_DAY_BONUS * 100) / 100;
};

export const calcDesmontagemFirst = (montadorAmount: number): number => {
  return Math.round(montadorAmount * DESMONTAGEM_FIRST_SPLIT * 100) / 100;
};

export const calcDesmontagemSecond = (montadorAmount: number): number => {
  return Math.round(montadorAmount * DESMONTAGEM_SECOND_SPLIT * 100) / 100;
};
