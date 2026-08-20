import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard Shadcn-style utility to dynamically merge Tailwind classes
 * resolving style hierarchy issues correctly.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Standard Date of Birth and Timestamp Formatter in DD/MM/YYYY format
 */
export function formatDateDDMMYYYY(dateInput?: string | Date | null): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Parse DD/MM/YYYY string to YYYY-MM-DD for standard ISO/Date compatibility
 */
export function parseDDMMYYYYToISO(ddmmyyyy: string): string {
  if (!ddmmyyyy) return "";
  const parts = ddmmyyyy.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return ddmmyyyy;
}
