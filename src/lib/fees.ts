// Platform fee calculation
// Montador bids X → client pays X * 1.2 → montador receives X * 0.9 → platform keeps X * 0.3

export const PLATFORM_CLIENT_FEE = 0.20; // 20% added for the client
export const PLATFORM_MONTADOR_FEE = 0.10; // 10% deducted from montador

// Desmontagem split: montador gets 40% on disassembly confirmation, 60% on assembly confirmation
export const DESMONTAGEM_FIRST_SPLIT = 0.40;
export const DESMONTAGEM_SECOND_SPLIT = 0.60;

export const calcClientTotal = (bidAmount: number): number => {
  return Math.round(bidAmount * (1 + PLATFORM_CLIENT_FEE) * 100) / 100;
};

export const calcMontadorReceives = (bidAmount: number): number => {
  return Math.round(bidAmount * (1 - PLATFORM_MONTADOR_FEE) * 100) / 100;
};

export const calcDesmontagemFirst = (montadorAmount: number): number => {
  return Math.round(montadorAmount * DESMONTAGEM_FIRST_SPLIT * 100) / 100;
};

export const calcDesmontagemSecond = (montadorAmount: number): number => {
  return Math.round(montadorAmount * DESMONTAGEM_SECOND_SPLIT * 100) / 100;
};
