// Regras de negócio ClickMont
// Valor_Montagem = Valor_da_Nota × 10%
// ClickMont: 23% do Valor_Montagem
// Montador: 77% do Valor_Montagem

export const MONTAGEM_RATE = 0.10;
export const CLICKMONT_RATE = 0.23;
export const MONTADOR_RATE = 0.77;

// Desmontagem: montador recebe 40% na confirmação da desmontagem, 60% na montagem
export const DESMONTAGEM_FIRST_SPLIT = 0.40;
export const DESMONTAGEM_SECOND_SPLIT = 0.60;

// Bônus de produtividade (conclusão no mesmo dia)
export const SAME_DAY_BONUS = 0.10;

/** Taxa de montagem = 10% do valor da nota fiscal */
export const calcValorMontagem = (valorNota: number): number =>
  Math.round(valorNota * MONTAGEM_RATE * 100) / 100;

/** Valor total pago pelo cliente = taxa de montagem (10% da nota) */
export const calcClientTotal = (valorNota: number): number =>
  calcValorMontagem(valorNota);

/** Valor que o montador recebe = 77% do valor de montagem */
export const calcMontadorReceives = (valorMontagem: number): number =>
  Math.round(valorMontagem * MONTADOR_RATE * 100) / 100;

/** Comissão ClickMont = 23% do valor de montagem */
export const calcClickmontFee = (valorMontagem: number): number =>
  Math.round(valorMontagem * CLICKMONT_RATE * 100) / 100;

export const calcSameDayBonus = (montadorAmount: number): number =>
  Math.round(montadorAmount * SAME_DAY_BONUS * 100) / 100;

export const calcDesmontagemFirst = (montadorAmount: number): number =>
  Math.round(montadorAmount * DESMONTAGEM_FIRST_SPLIT * 100) / 100;

export const calcDesmontagemSecond = (montadorAmount: number): number =>
  Math.round(montadorAmount * DESMONTAGEM_SECOND_SPLIT * 100) / 100;
