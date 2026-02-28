// Platform fee calculation
// Default platform fee: 25% (range 20%–30% depending on category/complexity)
// Client pays full amount → montador receives 75% → platform retains 25%

export const PLATFORM_FEE_DEFAULT = 0.25; // 25% default
export const PLATFORM_FEE_MIN = 0.20; // 20% minimum
export const PLATFORM_FEE_MAX = 0.30; // 30% maximum

// Legacy aliases for backward compatibility
export const PLATFORM_CLIENT_FEE = 0.20;
export const PLATFORM_MONTADOR_FEE = 0.10;

// Desmontagem split: montador gets 40% on disassembly confirmation, 60% on assembly confirmation
export const DESMONTAGEM_FIRST_SPLIT = 0.40;
export const DESMONTAGEM_SECOND_SPLIT = 0.60;

// Same-day completion bonus
export const SAME_DAY_BONUS = 0.10; // 10% bonus

export const calcClientTotal = (bidAmount: number): number => {
  return Math.round(bidAmount * (1 + PLATFORM_CLIENT_FEE) * 100) / 100;
};

export const calcMontadorReceives = (bidAmount: number, isUrgent: boolean = false): number => {
  if (isUrgent) return Math.round(bidAmount * 100) / 100;
  return Math.round(bidAmount * (1 - PLATFORM_FEE_DEFAULT) * 100) / 100;
};

export const calcPlatformFee = (totalAmount: number, feeRate: number = PLATFORM_FEE_DEFAULT): number => {
  return Math.round(totalAmount * feeRate * 100) / 100;
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
