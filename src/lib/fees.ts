// Platform fee calculation — Markup Model
// Montador bids R$ X → Client pays X + 20% markup → Montador receives X - 5% intermediation fee
// Example: Montador bids R$100 → Client pays R$120 → Montador receives R$95 → Platform earns R$25

export const CLIENT_MARKUP = 0.20; // 20% markup added to client price
export const MONTADOR_FEE = 0.05; // 5% intermediation fee deducted from montador

// Desmontagem split: montador gets 40% on disassembly confirmation, 60% on assembly confirmation
export const DESMONTAGEM_FIRST_SPLIT = 0.40;
export const DESMONTAGEM_SECOND_SPLIT = 0.60;

// Same-day completion bonus
export const SAME_DAY_BONUS = 0.10; // 10% bonus

// Legacy aliases for backward compatibility (deprecated)
export const PLATFORM_FEE_DEFAULT = 0.25;
export const PLATFORM_CLIENT_FEE = CLIENT_MARKUP;
export const PLATFORM_MONTADOR_FEE = MONTADOR_FEE;

/**
 * Calculate what the client pays: bid + 20% markup
 */
export const calcClientTotal = (bidAmount: number): number => {
  return Math.round(bidAmount * (1 + CLIENT_MARKUP) * 100) / 100;
};

/**
 * Calculate what the montador receives: bid - 5% fee (urgent = no fee)
 */
export const calcMontadorReceives = (bidAmount: number, isUrgent: boolean = false): number => {
  if (isUrgent) return Math.round(bidAmount * 100) / 100;
  return Math.round(bidAmount * (1 - MONTADOR_FEE) * 100) / 100;
};

/**
 * Calculate total platform revenue from an order
 */
export const calcPlatformFee = (bidAmount: number): number => {
  const clientTotal = calcClientTotal(bidAmount);
  const montadorReceives = calcMontadorReceives(bidAmount);
  return Math.round((clientTotal - montadorReceives) * 100) / 100;
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
