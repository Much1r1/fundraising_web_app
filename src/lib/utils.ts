import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseUTCDate(dateString: string | null | undefined): Date {
  // Handle null or undefined values
  if (!dateString) {
    return new Date();
  }
  
  // Ensure date is parsed as UTC
  const date = new Date(dateString + (dateString.includes('Z') ? '' : 'Z'));
  
  // Return current date if invalid
  return isNaN(date.getTime()) ? new Date() : date;
}
