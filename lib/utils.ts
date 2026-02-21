import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const isValidNIF = (nif: string) => {
  const cleanNif = String(nif).replace(/[^0-9]/g, '');
  if (cleanNif.length !== 9) return false;

  let total = 0;
  for (let i = 0; i < 8; i++) {
    total += parseInt(cleanNif.charAt(i), 10) * (9 - i);
  }

  const modulo = total % 11;
  const checkDigit = modulo < 2 ? 0 : 11 - modulo;

  return checkDigit === parseInt(cleanNif.charAt(8), 10);
};
