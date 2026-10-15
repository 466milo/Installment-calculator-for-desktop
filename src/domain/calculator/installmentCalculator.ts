/** Pure calculation functions. No React or database dependencies. Never divides by zero. */
export const calculateMarkup = (actualPrice: number, percentage: number) =>
  (actualPrice * percentage) / 100;

export const calculateTotalPrice = (actualPrice: number, markup: number) => actualPrice + markup;

export const calculateDownPaymentFromPercentage = (total: number, percentage: number) =>
  (total * percentage) / 100;

export const calculatePercentageFromDownPayment = (total: number, downPayment: number) =>
  total <= 0 ? 0 : (downPayment / total) * 100;

export const calculateRemainingAmount = (total: number, downPayment: number) => total - downPayment;

export const calculateMonthlyInstallment = (remaining: number, installments: number) =>
  installments <= 0 ? 0 : remaining / installments;
