import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const adjectives = [
  "שמח", "נחמד", "חברותי", "מתוק", "נעים",
  "קסום", "מרתק", "מקסים", "נלהב", "חייכן"
]

const nouns = [
  "אורח", "מבקר", "חבר", "שכן", "קפה",
  "תה", "עוגה", "מאפה", "שולחן", "כוס"
]

export function generateUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 100)
  
  return `${adjective}_${noun}${number}`
}
