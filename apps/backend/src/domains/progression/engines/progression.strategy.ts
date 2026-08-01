// Progression curve strategy — the single, swappable definition of "how much
// accumulated XP does each level cost". Keeping this behind an interface lets the
// ProgressionEngine stay closed for modification but open for extension
// (Strategy Pattern): seasons, prestige curves, double-XP events or entirely
// different pacing can be introduced by providing another strategy, without
// touching the engine or any consumer.

// Tunable parameters of the default continuous curve. Centralised here so there
// are no magic numbers scattered through the math, and so a curve can be
// reshaped purely through configuration.
export interface ProgressionConfig {
  // Accumulated XP required to reach level 1. Also the value the curve is
  // anchored to at level 1 (see ContinuousCurveStrategy).
  baseXp: number
  // Steepness of the curve. Higher values make late levels cost dramatically more.
  exponent: number
  // Scale of the exponential term relative to the linear term.
  multiplier: number
}

// Default curve, tuned so that:
//   - level 0 costs 0 XP and level 1 costs exactly 500 XP (business rule);
//   - the accumulated cost grows on a smooth, continuous power curve;
//   - calculateLevel(12500) === 12 (spec example) and getProgress(750) yields
//     nextLevelXp 1161 / progress 37.82% (spec example).
// The prompt's illustrative { exponent: 1.85, multiplier: 220 } only demonstrates
// the config shape; these values are the ones that reproduce the stated results.
export const DEFAULT_PROGRESSION_CONFIG: ProgressionConfig = {
  baseXp: 500,
  exponent: 1.52,
  multiplier: 185,
}

// A progression curve. `totalXpForLevel` returns the accumulated XP a character
// must own to *be* at `level`. Any implementation must satisfy two invariants the
// engine relies on:
//   1. totalXpForLevel(0) === 0
//   2. it is strictly increasing (levelling up always costs more XP)
export interface ProgressionStrategy {
  totalXpForLevel (level: number): number
}

// Continuous, table-free power curve.
//
//   f(L) = multiplier * L^exponent + (baseXp - multiplier) * L
//
// This shape is chosen because it algebraically guarantees the two hard business
// rules for ANY exponent/multiplier:
//   f(0) = 0                         (level 0 costs nothing)
//   f(1) = multiplier + baseXp - multiplier = baseXp   (level 1 costs baseXp)
// so re-tuning the curve can never accidentally break "level 1 === 500 XP".
export class ContinuousCurveStrategy implements ProgressionStrategy {
  constructor (private readonly config: ProgressionConfig = DEFAULT_PROGRESSION_CONFIG) {}

  totalXpForLevel (level: number): number {
    const normalizedLevel = Math.max(0, Math.floor(level))
    if (normalizedLevel === 0) return 0

    const { baseXp, exponent, multiplier } = this.config
    const exponentialTerm = multiplier * Math.pow(normalizedLevel, exponent)
    const linearTerm = (baseXp - multiplier) * normalizedLevel

    return Math.round(exponentialTerm + linearTerm)
  }
}
