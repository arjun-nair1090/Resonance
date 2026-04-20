import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const moods = ["Happy", "Sad", "Gym", "Party", "Relaxed", "Romantic", "Focus", "Angry"];
export const locationContexts = ["Auto", "City", "Beach", "Mountains", "Commute", "Campus"];
