import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function initials(name: string): string {
  return name.
  split(' ').
  map((n) => n[0]).
  slice(0, 2).
  join('').
  toUpperCase();
}

export function getAdjustedDueDate(dateStr: string, paymentDay: number | string): Date {
  const date = new Date(dateStr);
  let day = parseInt(String(paymentDay), 10);
  if (isNaN(day) || day < 1 || day > 31) {
    day = 5;
  }
  date.setDate(day);
  return date;
}

export function calculateLateInterest(
  amountDue: number,
  dueDateStr: string,
  interestRatePa: number = 12,
  gracePeriodDays: number = 5,
  paymentDay: number | string = 5
): { interest: number; daysLate: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const adjustedDueDate = getAdjustedDueDate(dueDateStr, paymentDay);
  adjustedDueDate.setHours(0, 0, 0, 0);
  
  if (today <= adjustedDueDate) {
    return { interest: 0, daysLate: 0 };
  }
  
  const diffTime = today.getTime() - adjustedDueDate.getTime();
  const daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (daysLate <= gracePeriodDays) {
    return { interest: 0, daysLate };
  }
  
  const rate = interestRatePa / 100;
  const interest = amountDue * rate * (daysLate / 365);
  
  return {
    interest: Math.round(interest * 100) / 100,
    daysLate
  };
}