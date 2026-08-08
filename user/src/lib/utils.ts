

export function calculateRentalPrice(
  dailyPrice: number,
  weeklyPrice: number | null,
  monthlyPrice: number | null,
  rentalDays: number
) {
  let pricePerDay = dailyPrice;

  if (rentalDays >= 30 && monthlyPrice) {
    pricePerDay = monthlyPrice / 30;
  } else if (rentalDays >= 7 && weeklyPrice) {
    pricePerDay = weeklyPrice / 7;
  }

  return Math.round(pricePerDay);
}

export function calculateLateFees(
  pricePerDay: number,
  rentalEnd: Date,
  actualReturn: Date
) {
  if (actualReturn <= rentalEnd) return 0;

  const lateDays = Math.ceil(
    (actualReturn.getTime() - rentalEnd.getTime()) / (1000 * 60 * 60 * 24)
  );
  const penaltyRate = pricePerDay * 0.5;

  return Math.round(lateDays * penaltyRate);
}

export function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RH-${timestamp}-${random}`;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
