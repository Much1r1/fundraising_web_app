import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseUTCDate(dateString: string): Date {
  // Ensure date is parsed as UTC
  return new Date(dateString + (dateString.includes('Z') ? '' : 'Z'));
}
