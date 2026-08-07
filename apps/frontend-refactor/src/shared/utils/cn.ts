export type ClassValue = string | false | null | undefined

/** Tiny className joiner. Falsy values are dropped; later classes take precedence. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
